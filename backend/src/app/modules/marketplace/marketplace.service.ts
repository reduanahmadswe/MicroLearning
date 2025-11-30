import { MarketplaceItem, Purchase, Review, CreatorPayout } from './marketplace.model';
import {
  ICreateMarketplaceItemRequest,
  IUpdateMarketplaceItemRequest,
  ICreatePurchaseRequest,
  ICreateReviewRequest,
  IUpdateReviewRequest,
  IMarketplaceSearchQuery,
  IMarketplaceStats,
  ICreatorEarnings,
} from './marketplace.types';
import ApiError from '../../../utils/ApiError';
import httpStatus from 'http-status';
import SSLCommerzPayment from 'sslcommerz-lts';
import User from '../auth/auth.model';

// Marketplace Item Services
export const createMarketplaceItem = async (creatorId: string, data: ICreateMarketplaceItemRequest) => {
  const item = await MarketplaceItem.create({
    ...data,
    creator: creatorId,
  });

  return item.populate('creator', 'name email avatar');
};

export const getMarketplaceItems = async (filters: IMarketplaceSearchQuery) => {
  const {
    query,
    itemType,
    category,
    tags,
    minPrice,
    maxPrice,
    minRating,
    creatorId,
    sortBy = 'recent',
    page = 1,
    limit = 20,
  } = filters;

  const filter: any = { status: 'published', isPublished: true };

  if (query) filter.$text = { $search: query };
  if (itemType) filter.itemType = itemType;
  if (category) filter.category = category;
  if (creatorId) filter.creator = creatorId;
  if (tags && tags.length > 0) filter.tags = { $in: tags };
  if (minRating) filter.rating = { $gte: minRating };

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  let sort: any = {};
  switch (sortBy) {
    case 'popular':
      sort = { salesCount: -1 };
      break;
    case 'price-low':
      sort = { price: 1 };
      break;
    case 'price-high':
      sort = { price: -1 };
      break;
    case 'rating':
      sort = { rating: -1 };
      break;
    case 'recent':
    default:
      sort = { publishedAt: -1 };
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    MarketplaceItem.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('creator', 'name email avatar')
      .lean(),
    MarketplaceItem.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

export const getMarketplaceItemDetails = async (itemId: string) => {
  const item = await MarketplaceItem.findById(itemId)
    .populate('creator', 'name email avatar')
    .populate('itemId');

  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Marketplace item not found');
  }

  if (item.status !== 'published') {
    throw new ApiError(httpStatus.FORBIDDEN, 'This item is not available');
  }

  const reviews = await Review.find({ item: itemId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(10);

  return { item, reviews };
};

export const updateMarketplaceItem = async (
  itemId: string,
  creatorId: string,
  data: IUpdateMarketplaceItemRequest
) => {
  const item = await MarketplaceItem.findById(itemId);

  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Marketplace item not found');
  }

  if (item.creator.toString() !== creatorId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only creator can update item');
  }

  Object.assign(item, data);

  if (data.status === 'published' && !item.isPublished) {
    item.isPublished = true;
    item.publishedAt = new Date();
  }

  await item.save();
  return item;
};

export const deleteMarketplaceItem = async (itemId: string, creatorId: string) => {
  const item = await MarketplaceItem.findById(itemId);

  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Marketplace item not found');
  }

  if (item.creator.toString() !== creatorId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only creator can delete item');
  }

  if (item.salesCount > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete item with existing sales');
  }

  await MarketplaceItem.findByIdAndDelete(itemId);
  return { message: 'Marketplace item deleted successfully' };
};

// Purchase Services
export const createPurchase = async (buyerId: string, data: ICreatePurchaseRequest) => {
  const item = await MarketplaceItem.findById(data.itemId);

  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Marketplace item not found');
  }

  if (item.status !== 'published') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Item is not available for purchase');
  }

  // Check if already purchased
  const existingPurchase = await Purchase.findOne({
    buyer: buyerId,
    item: data.itemId,
    paymentStatus: 'completed',
  });

  if (existingPurchase) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You have already purchased this item');
  }

  // Calculate final price with discount
  let finalPrice = item.price;
  if (item.discount && item.discount.isActive) {
    const now = new Date();
    if (
      (!item.discount.startDate || item.discount.startDate <= now) &&
      (!item.discount.endDate || item.discount.endDate >= now)
    ) {
      if (item.discount.type === 'percentage') {
        finalPrice = item.price * (1 - item.discount.value / 100);
      } else {
        finalPrice = Math.max(0, item.price - item.discount.value);
      }
    }
  }

  const purchase = await Purchase.create({
    buyer: buyerId,
    item: data.itemId,
    amount: finalPrice,
    currency: item.currency,
    paymentMethod: data.paymentMethod,
    paymentStatus: 'pending',
  });

  // Initialize SSLCommerz Payment
  const paymentUrl = await initializeSSLCommerzPayment(purchase._id.toString(), buyerId, item, finalPrice);

  return { purchase: await purchase.populate('item'), paymentUrl };
};

// SSLCommerz Payment Integration
const initializeSSLCommerzPayment = async (
  purchaseId: string,
  buyerId: string,
  item: any,
  amount: number
): Promise<string> => {
  const buyer = await User.findById(buyerId);
  if (!buyer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const store_id = process.env.SSLCOMMERZ_STORE_ID || '';
  const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || '';
  const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';

  if (!store_id || !store_passwd) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'SSLCommerz credentials not configured');
  }

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  const data = {
    total_amount: amount,
    currency: item.currency || 'BDT',
    tran_id: purchaseId,
    success_url: `${baseUrl}/api/marketplace/payment/success?tran_id=${purchaseId}`,
    fail_url: `${baseUrl}/api/marketplace/payment/fail?tran_id=${purchaseId}`,
    cancel_url: `${baseUrl}/api/marketplace/payment/cancel?tran_id=${purchaseId}`,
    ipn_url: `${baseUrl}/api/marketplace/payment/ipn`,
    product_name: item.title,
    product_category: item.category,
    product_profile: 'general',
    cus_name: buyer.name || 'Customer',
    cus_email: buyer.email,
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: buyer.phone || '01700000000',
    shipping_method: 'NO',
    multi_card_name: 'mastercard,visacard,amexcard,bkash,nagad,rocket',
    value_a: buyerId,
    value_b: item._id.toString(),
    value_c: purchaseId,
  };

  const apiResponse = await sslcz.init(data);
  
  if (apiResponse.status === 'SUCCESS' && apiResponse.GatewayPageURL) {
    return apiResponse.GatewayPageURL;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment initialization failed');
  }
};

// Payment Success Handler
export const handlePaymentSuccess = async (tranId: string, data: any) => {
  const purchase = await Purchase.findById(tranId);
  
  if (!purchase) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Purchase not found');
  }

  // Update purchase status
  purchase.paymentStatus = 'completed';
  purchase.transactionId = data.bank_tran_id || data.tran_id;
  purchase.paymentIntentId = data.val_id;
  purchase.purchasedAt = new Date();
  await purchase.save();

  // Update item stats
  const item = await MarketplaceItem.findById(purchase.item);
  if (item) {
    item.salesCount += 1;
    item.revenue += purchase.amount;
    await item.save();
  }

  return purchase;
};

// Payment Fail Handler
export const handlePaymentFail = async (tranId: string) => {
  const purchase = await Purchase.findById(tranId);
  
  if (!purchase) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Purchase not found');
  }

  purchase.paymentStatus = 'failed';
  await purchase.save();

  return purchase;
};

// Payment Validation
export const validatePayment = async (data: any) => {
  const store_id = process.env.SSLCOMMERZ_STORE_ID || '';
  const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || '';
  const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const validation = await sslcz.validate(data);

  return validation;
};

export const getUserPurchases = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [purchases, total] = await Promise.all([
    Purchase.find({ buyer: userId, paymentStatus: 'completed' })
      .sort({ purchasedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('item'),
    Purchase.countDocuments({ buyer: userId, paymentStatus: 'completed' }),
  ]);

  return {
    purchases,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

// Review Services
export const createReview = async (userId: string, data: ICreateReviewRequest) => {
  // Verify purchase
  const purchase = await Purchase.findOne({
    _id: data.purchaseId,
    buyer: userId,
    item: data.itemId,
    paymentStatus: 'completed',
  });

  if (!purchase) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You must purchase this item before reviewing');
  }

  // Check if already reviewed
  const existingReview = await Review.findOne({
    user: userId,
    item: data.itemId,
  });

  if (existingReview) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You have already reviewed this item');
  }

  const review = await Review.create({
    ...data,
    user: userId,
    item: data.itemId,
    purchase: data.purchaseId,
  });

  // Update item rating
  const item = await MarketplaceItem.findById(data.itemId);
  if (item) {
    const newReviewCount = item.reviewCount + 1;
    item.rating = ((item.rating * item.reviewCount) + data.rating) / newReviewCount;
    item.reviewCount = newReviewCount;
    await item.save();
  }

  return review.populate('user', 'name avatar');
};

export const updateReview = async (reviewId: string, userId: string, data: IUpdateReviewRequest) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }

  if (review.user.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only review author can update');
  }

  const oldRating = review.rating;
  Object.assign(review, data);
  await review.save();

  // Update item rating if rating changed
  if (data.rating && data.rating !== oldRating) {
    const item = await MarketplaceItem.findById(review.item);
    if (item) {
      item.rating = ((item.rating * item.reviewCount) - oldRating + data.rating) / item.reviewCount;
      await item.save();
    }
  }

  return review;
};

// Statistics and Earnings
export const getMarketplaceStats = async () => {
  const [totalItems, sales] = await Promise.all([
    MarketplaceItem.countDocuments({ status: 'published' }),
    Purchase.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  const avgRating = await MarketplaceItem.aggregate([
    { $match: { status: 'published', reviewCount: { $gt: 0 } } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } },
  ]);

  const topSelling = await MarketplaceItem.find({ status: 'published' })
    .sort({ salesCount: -1 })
    .limit(10)
    .populate('creator', 'name');

  const stats: IMarketplaceStats = {
    totalItems,
    totalSales: sales[0]?.totalSales || 0,
    totalRevenue: sales[0]?.totalRevenue || 0,
    averageRating: avgRating[0]?.avgRating || 0,
    topSellingItems: topSelling.map((item) => ({
      item: item as any,
      sales: item.salesCount,
      revenue: item.revenue,
    })),
    recentSales: [],
    categoryDistribution: [],
  };

  return stats;
};

export const getCreatorEarnings = async (creatorId: string) => {
  const items = await MarketplaceItem.find({ creator: creatorId });
  const itemIds = items.map((i) => i._id);

  const [payouts, sales] = await Promise.all([
    CreatorPayout.find({ creator: creatorId }).sort({ createdAt: -1 }).limit(10),
    Purchase.aggregate([
      { $match: { item: { $in: itemIds }, paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          salesCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const completedPayouts = payouts.filter((p) => p.status === 'completed');
  const pendingPayouts = payouts.filter((p) => p.status === 'pending');

  const earnings: ICreatorEarnings = {
    totalEarnings: sales[0]?.totalRevenue || 0,
    pendingPayouts: pendingPayouts.reduce((sum, p) => sum + p.amount, 0),
    completedPayouts: completedPayouts.reduce((sum, p) => sum + p.amount, 0),
    salesCount: sales[0]?.salesCount || 0,
    averageItemPrice: items.length > 0 ? items.reduce((sum, i) => sum + i.price, 0) / items.length : 0,
    topSellingItems: [],
    recentPayouts: payouts as any,
  };

  return earnings;
};

export default {
  createMarketplaceItem,
  getMarketplaceItems,
  getMarketplaceItemDetails,
  updateMarketplaceItem,
  deleteMarketplaceItem,
  createPurchase,
  getUserPurchases,
  createReview,
  updateReview,
  getMarketplaceStats,
  getCreatorEarnings,
};

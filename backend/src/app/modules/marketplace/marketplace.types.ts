import { Types } from 'mongoose';

export interface IMarketplaceItem {
  _id: Types.ObjectId;
  creator: Types.ObjectId;
  itemType: 'lesson' | 'course' | 'bundle';
  itemId: Types.ObjectId; // Reference to Lesson or Course
  title: string;
  description: string;
  price: number;
  currency: string;
  discount?: IDiscount;
  coverImage?: string;
  previewVideo?: string;
  features: string[];
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'suspended' | 'pending' | 'rejected';
  salesCount: number;
  revenue: number;
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  publishedAt?: Date;
  isReported?: boolean;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface IPurchase {
  _id: Types.ObjectId;
  buyer: Types.ObjectId;
  item: Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'sslcommerz';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentIntentId?: string;
  transactionId?: string;
  refundedAt?: Date;
  refundReason?: string;
  purchasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview {
  _id: Types.ObjectId;
  item: Types.ObjectId;
  user: Types.ObjectId;
  purchase: Types.ObjectId;
  rating: number;
  title?: string;
  comment?: string;
  helpful: number;
  reported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatorPayout {
  _id: Types.ObjectId;
  creator: Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: string;
  paymentDetails?: any;
  period: {
    start: Date;
    end: Date;
  };
  salesIncluded: Types.ObjectId[];
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateMarketplaceItemRequest {
  itemType: 'lesson' | 'course' | 'bundle';
  itemId: string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  discount?: IDiscount;
  coverImage?: string;
  previewVideo?: string;
  features: string[];
  category: string;
  tags?: string[];
}

export interface IUpdateMarketplaceItemRequest {
  title?: string;
  description?: string;
  price?: number;
  discount?: IDiscount;
  coverImage?: string;
  previewVideo?: string;
  features?: string[];
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'suspended';
}

export interface ICreatePurchaseRequest {
  itemId: string;
  paymentMethod: 'sslcommerz';
}

export interface ICreateReviewRequest {
  itemId: string;
  purchaseId: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface IUpdateReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface IMarketplaceSearchQuery {
  query?: string;
  itemType?: 'lesson' | 'course' | 'bundle';
  category?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  creatorId?: string;
  sortBy?: 'recent' | 'popular' | 'price-low' | 'price-high' | 'rating';
  page?: number;
  limit?: number;
}

export interface IMarketplaceStats {
  totalItems: number;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  topSellingItems: {
    item: IMarketplaceItem;
    sales: number;
    revenue: number;
  }[];
  recentSales: IPurchase[];
  categoryDistribution: {
    category: string;
    count: number;
    revenue: number;
  }[];
}

export interface ICreatorEarnings {
  totalEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  salesCount: number;
  averageItemPrice: number;
  topSellingItems: {
    item: IMarketplaceItem;
    sales: number;
    revenue: number;
  }[];
  recentPayouts: ICreatorPayout[];
}

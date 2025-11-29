import { z } from 'zod';

const discountSchema = z.object({
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const createMarketplaceItemSchema = z.object({
  body: z.object({
    itemType: z.enum(['lesson', 'course', 'bundle']),
    itemId: z.string().min(1),
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(5000),
    price: z.number().min(0),
    currency: z.string().length(3).toUpperCase().optional(),
    discount: discountSchema.optional(),
    coverImage: z.string().url().optional(),
    previewVideo: z.string().url().optional(),
    features: z.array(z.string()),
    category: z.string().min(1),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateMarketplaceItemSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(5000).optional(),
    price: z.number().min(0).optional(),
    discount: discountSchema.optional(),
    coverImage: z.string().url().optional(),
    previewVideo: z.string().url().optional(),
    features: z.array(z.string()).optional(),
    category: z.string().min(1).optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'published', 'suspended']).optional(),
  }),
});

export const createPurchaseSchema = z.object({
  body: z.object({
    itemId: z.string().min(1),
    paymentMethod: z.enum(['stripe', 'bkash', 'paypal']),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    itemId: z.string().min(1),
    purchaseId: z.string().min(1),
    rating: z.number().min(1).max(5),
    title: z.string().max(200).optional(),
    comment: z.string().max(2000).optional(),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    title: z.string().max(200).optional(),
    comment: z.string().max(2000).optional(),
  }),
});

export const searchMarketplaceSchema = z.object({
  query: z.object({
    query: z.string().optional(),
    itemType: z.enum(['lesson', 'course', 'bundle']).optional(),
    category: z.string().optional(),
    tags: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    minRating: z.string().optional(),
    creatorId: z.string().optional(),
    sortBy: z.enum(['recent', 'popular', 'price-low', 'price-high', 'rating']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

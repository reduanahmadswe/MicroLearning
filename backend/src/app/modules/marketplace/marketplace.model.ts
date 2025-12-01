import { Schema, model } from 'mongoose';
import {
  IMarketplaceItem,
  IPurchase,
  IReview,
  ICreatorPayout,
} from './marketplace.types';

const discountSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const marketplaceItemSchema = new Schema<IMarketplaceItem>(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ['lesson', 'course', 'bundle'],
      required: true,
      index: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'itemType',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    discount: discountSchema,
    coverImage: String,
    previewVideo: String,
    features: [String],
    category: {
      type: String,
      required: true,
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'suspended', 'pending', 'rejected'],
      default: 'pending',
      index: true,
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    revenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: Date,
    isReported: {
      type: Boolean,
      default: false,
      index: true,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

marketplaceItemSchema.index({ title: 'text', description: 'text' });
marketplaceItemSchema.index({ creator: 1, status: 1 });
marketplaceItemSchema.index({ category: 1, rating: -1 });
marketplaceItemSchema.index({ tags: 1 });
marketplaceItemSchema.index({ salesCount: -1 });
marketplaceItemSchema.index({ rating: -1 });

const purchaseSchema = new Schema<IPurchase>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    item: {
      type: Schema.Types.ObjectId,
      ref: 'MarketplaceItem',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ['sslcommerz'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentIntentId: String,
    transactionId: String,
    refundedAt: Date,
    refundReason: String,
    purchasedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

purchaseSchema.index({ buyer: 1, item: 1 });
purchaseSchema.index({ item: 1, paymentStatus: 1 });
purchaseSchema.index({ purchasedAt: -1 });

const reviewSchema = new Schema<IReview>(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: 'MarketplaceItem',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    purchase: {
      type: Schema.Types.ObjectId,
      ref: 'Purchase',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    reported: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ item: 1, user: 1 }, { unique: true });
reviewSchema.index({ item: 1, rating: -1 });

const creatorPayoutSchema = new Schema<ICreatorPayout>(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentDetails: Schema.Types.Mixed,
    period: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
    },
    salesIncluded: [{
      type: Schema.Types.ObjectId,
      ref: 'Purchase',
    }],
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

creatorPayoutSchema.index({ creator: 1, status: 1 });
creatorPayoutSchema.index({ 'period.start': 1, 'period.end': 1 });

export const MarketplaceItem = model<IMarketplaceItem>('MarketplaceItem', marketplaceItemSchema);
export const Purchase = model<IPurchase>('Purchase', purchaseSchema);
export const Review = model<IReview>('Review', reviewSchema);
export const CreatorPayout = model<ICreatorPayout>('CreatorPayout', creatorPayoutSchema);

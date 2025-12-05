import { Schema, model, models, Document, Types } from 'mongoose';

export interface IReaction {
  user: Types.ObjectId;
  type: 'like' | 'love' | 'celebrate' | 'insightful' | 'curious';
  createdAt: Date;
}

export interface IComment {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPost extends Document {
  user: Types.ObjectId;
  content: string;
  images?: string[];
  video?: string;
  type: 'text' | 'achievement' | 'learning' | 'question' | 'milestone';
  metadata?: {
    courseId?: string;
    lessonId?: string;
    badgeId?: string;
    certificateId?: string;
    achievement?: string;
    xpGained?: number;
    levelUp?: number;
  };
  reactions: IReaction[];
  comments: IComment[];
  shares: Types.ObjectId[];
  sharedPost?: Types.ObjectId;
  visibility: 'public' | 'friends' | 'private';
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reactionSchema = new Schema<IReaction>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['like', 'love', 'celebrate', 'insightful', 'curious'],
    default: 'like',
  },
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const postSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, maxlength: 5000, default: '' },
    images: [{ type: String }],
    video: { type: String },
    type: {
      type: String,
      enum: ['text', 'achievement', 'learning', 'question', 'milestone'],
      default: 'text',
    },
    metadata: {
      courseId: { type: String },
      lessonId: { type: String },
      badgeId: { type: String },
      certificateId: { type: String },
      achievement: { type: String },
      xpGained: { type: Number },
      levelUp: { type: Number },
    },
    reactions: { type: [reactionSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
    shares: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    sharedPost: { type: Schema.Types.ObjectId, ref: 'Post' },
    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'friends',
    },
    isEdited: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'reactions.user': 1 });
postSchema.index({ 'comments.user': 1 });

// Virtual for reaction count
postSchema.virtual('reactionCount').get(function () {
  return this.reactions?.length || 0;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function () {
  return this.comments?.length || 0;
});

// Virtual for share count
postSchema.virtual('shareCount').get(function () {
  return this.shares?.length || 0;
});

export const Post = model<IPost>('FeedPost', postSchema);

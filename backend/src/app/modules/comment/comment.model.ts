import mongoose, { Schema } from 'mongoose';
import { IComment } from './comment.types';

const commentSchema = new Schema<IComment>(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment must be at least 1 character'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    moderationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
commentSchema.index({ lesson: 1, createdAt: -1 });
commentSchema.index({ lesson: 1, parentComment: 1 });
commentSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IComment>('Comment', commentSchema);

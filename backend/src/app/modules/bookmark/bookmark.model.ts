import mongoose, { Schema } from 'mongoose';
import { IBookmark } from './bookmark.types';

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    collection: {
      type: String,
      default: 'Default',
      index: true,
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index - user can't bookmark same lesson twice
bookmarkSchema.index({ user: 1, lesson: 1 }, { unique: true });

// Index for collection queries
bookmarkSchema.index({ user: 1, collection: 1 });

export default mongoose.model<IBookmark>('Bookmark', bookmarkSchema);

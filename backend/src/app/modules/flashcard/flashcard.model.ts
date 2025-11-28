import mongoose, { Schema } from 'mongoose';
import { IFlashcard } from './flashcard.types';

const flashcardSchema = new Schema<IFlashcard>(
  {
    front: {
      type: String,
      required: [true, 'Front content is required'],
      trim: true,
      maxlength: [1000, 'Front content cannot exceed 1000 characters'],
    },
    back: {
      type: String,
      required: [true, 'Back content is required'],
      trim: true,
      maxlength: [2000, 'Back content cannot exceed 2000 characters'],
    },
    hint: {
      type: String,
      trim: true,
      maxlength: [500, 'Hint cannot exceed 500 characters'],
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      index: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    // SRS (SM-2 Algorithm) fields
    easeFactor: {
      type: Number,
      default: 2.5,
      min: 1.3,
    },
    interval: {
      type: Number,
      default: 0,
      min: 0,
    },
    repetitions: {
      type: Number,
      default: 0,
      min: 0,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastReviewedAt: {
      type: Date,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    frontImage: {
      type: String,
    },
    backImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
flashcardSchema.index({ user: 1, nextReviewDate: 1 });
flashcardSchema.index({ user: 1, topic: 1 });
flashcardSchema.index({ lesson: 1, user: 1 });

export default mongoose.model<IFlashcard>('Flashcard', flashcardSchema);

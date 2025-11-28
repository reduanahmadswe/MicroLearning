import mongoose, { Schema } from 'mongoose';
import { IUserProgress } from './progress.types';

const userProgressSchema = new Schema<IUserProgress>(
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
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started',
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    mastery: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user-lesson uniqueness
userProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

// Update completedAt when status changes to completed
userProgressSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

const UserProgress = mongoose.model<IUserProgress>('UserProgress', userProgressSchema);

export default UserProgress;

import mongoose, { Schema } from 'mongoose';
import { IBadge, IUserAchievement } from './badge.types';

const badgeSchema = new Schema<IBadge>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    criteria: {
      type: {
        type: String,
        enum: ['streak', 'lessons_completed', 'quiz_perfect', 'xp_milestone', 'flashcard_mastered', 'topic_mastered'],
        required: true,
      },
      threshold: {
        type: Number,
        required: true,
      },
      topic: String,
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common',
      index: true,
    },
    xpReward: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const userAchievementSchema = new Schema<IUserAchievement>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    badge: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    earnedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index
userAchievementSchema.index({ user: 1, badge: 1 }, { unique: true });

// Index for querying completed achievements
userAchievementSchema.index({ user: 1, isCompleted: 1 });

export const Badge = mongoose.model<IBadge>('Badge', badgeSchema);
export const UserAchievement = mongoose.model<IUserAchievement>('UserAchievement', userAchievementSchema);

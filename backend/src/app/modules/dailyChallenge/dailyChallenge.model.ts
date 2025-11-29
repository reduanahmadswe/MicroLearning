import { Schema, model } from 'mongoose';
import {
  IDailyChallenge,
  IDailyChallengeProgress,
  IDailyChallengeStreak,
  IWeeklyChallenge,
  IWeeklyChallengeProgress,
} from './dailyChallenge.types';

const dailyChallengeSchema = new Schema<IDailyChallenge>(
  {
    challengeType: {
      type: String,
      enum: [
        'lesson_completion',
        'quiz_score',
        'study_time',
        'streak_maintain',
        'flashcard_review',
        'forum_participation',
        'video_watch',
        'custom',
      ],
      required: true,
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
      maxlength: 1000,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    target: {
      type: Number,
      required: true,
      min: 1,
    },
    requirement: {
      lessonCount: { type: Number, min: 0 },
      quizScore: { type: Number, min: 0, max: 100 },
      studyTimeMinutes: { type: Number, min: 0 },
      streakDays: { type: Number, min: 0 },
      flashcardCount: { type: Number, min: 0 },
      forumPosts: { type: Number, min: 0 },
      videoWatchTime: { type: Number, min: 0 },
      customCondition: { type: String },
    },
    rewards: {
      xp: { type: Number, required: true, min: 0 },
      coins: { type: Number, min: 0 },
      badgeId: { type: Schema.Types.ObjectId, ref: 'Badge' },
      itemId: { type: Schema.Types.ObjectId, ref: 'MarketplaceItem' },
    },
    availableDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
dailyChallengeSchema.index({ availableDate: 1, expiresAt: 1, isActive: 1 });
dailyChallengeSchema.index({ challengeType: 1, difficulty: 1 });

const dailyChallengeProgressSchema = new Schema<IDailyChallengeProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: 'DailyChallenge',
      required: true,
      index: true,
    },
    progress: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    target: {
      type: Number,
      required: true,
      min: 1,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    rewardsClaimed: {
      type: Boolean,
      default: false,
    },
    claimedAt: {
      type: Date,
    },
    metadata: {
      lessonsCompleted: [{ type: String }],
      quizzesTaken: [{ type: String }],
      studySessionIds: [{ type: String }],
      flashcardsReviewed: [{ type: String }],
      forumPostIds: [{ type: String }],
      videosWatched: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate progress tracking
dailyChallengeProgressSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

const dailyChallengeStreakSchema = new Schema<IDailyChallengeStreak>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastCompletedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalChallengesCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    streakBonusMultiplier: {
      type: Number,
      default: 1.0,
      min: 1.0,
      max: 3.0,
    },
    milestones: [
      {
        streakDays: { type: Number, required: true },
        achievedAt: { type: Date, required: true },
        bonusRewards: {
          xp: { type: Number, min: 0 },
          coins: { type: Number, min: 0 },
          badgeId: { type: Schema.Types.ObjectId, ref: 'Badge' },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const weeklyChallengeSchema = new Schema<IWeeklyChallenge>(
  {
    challengeType: {
      type: String,
      enum: [
        'total_lessons',
        'total_quizzes',
        'total_study_time',
        'course_completion',
        'forum_engagement',
        'video_completion',
        'custom',
      ],
      required: true,
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
      maxlength: 1000,
    },
    difficulty: {
      type: String,
      enum: ['medium', 'hard', 'extreme'],
      required: true,
    },
    target: {
      type: Number,
      required: true,
      min: 1,
    },
    requirement: {
      lessonCount: { type: Number, min: 0 },
      quizCount: { type: Number, min: 0 },
      studyTimeMinutes: { type: Number, min: 0 },
      courseCount: { type: Number, min: 0 },
      forumEngagement: { type: Number, min: 0 },
      videoCount: { type: Number, min: 0 },
      customCondition: { type: String },
    },
    rewards: {
      xp: { type: Number, required: true, min: 0 },
      coins: { type: Number, min: 0 },
      badgeId: { type: Schema.Types.ObjectId, ref: 'Badge' },
      itemId: { type: Schema.Types.ObjectId, ref: 'MarketplaceItem' },
      exclusiveContent: { type: Boolean, default: false },
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
weeklyChallengeSchema.index({ startDate: 1, endDate: 1, isActive: 1 });
weeklyChallengeSchema.index({ challengeType: 1, difficulty: 1 });

const weeklyChallengeProgressSchema = new Schema<IWeeklyChallengeProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: 'WeeklyChallenge',
      required: true,
      index: true,
    },
    progress: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    target: {
      type: Number,
      required: true,
      min: 1,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    rewardsClaimed: {
      type: Boolean,
      default: false,
    },
    claimedAt: {
      type: Date,
    },
    rank: {
      type: Number,
      min: 1,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index
weeklyChallengeProgressSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
weeklyChallengeProgressSchema.index({ challengeId: 1, progress: -1 }); // For ranking

export const DailyChallenge = model<IDailyChallenge>('DailyChallenge', dailyChallengeSchema);
export const DailyChallengeProgress = model<IDailyChallengeProgress>(
  'DailyChallengeProgress',
  dailyChallengeProgressSchema
);
export const DailyChallengeStreak = model<IDailyChallengeStreak>(
  'DailyChallengeStreak',
  dailyChallengeStreakSchema
);
export const WeeklyChallenge = model<IWeeklyChallenge>('WeeklyChallenge', weeklyChallengeSchema);
export const WeeklyChallengeProgress = model<IWeeklyChallengeProgress>(
  'WeeklyChallengeProgress',
  weeklyChallengeProgressSchema
);

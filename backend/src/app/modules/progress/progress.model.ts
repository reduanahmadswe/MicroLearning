import { Schema, model } from 'mongoose';
import {
  IProgressShare,
  IProgressStats,
  IProgressMilestone,
  IActivityFeed,
} from './progress.types';

const progressShareSchema = new Schema<IProgressShare>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    shareType: {
      type: String,
      enum: ['achievement', 'streak', 'course_complete', 'challenge_win', 'level_up', 'custom'],
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
    metadata: {
      achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement' },
      courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
      challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge' },
      streakDays: { type: Number },
      level: { type: Number },
      xpGained: { type: Number },
      customImage: { type: String },
    },
    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'friends',
    },
    reactions: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        reactionType: {
          type: String,
          enum: ['like', 'love', 'celebrate', 'clap', 'fire'],
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    shareCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
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

// Indexes for performance
progressShareSchema.index({ userId: 1, createdAt: -1 });
progressShareSchema.index({ visibility: 1, isActive: 1, createdAt: -1 });
progressShareSchema.index({ shareType: 1, createdAt: -1 });

const progressStatsSchema = new Schema<IProgressStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalXP: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentLevel: {
      type: Number,
      default: 1,
      min: 1,
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
    completedLessons: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedCourses: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalStudyTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    achievementsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    challengesWon: {
      type: Number,
      default: 0,
      min: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for leaderboard queries
progressStatsSchema.index({ totalXP: -1 });
progressStatsSchema.index({ currentStreak: -1 });
progressStatsSchema.index({ completedLessons: -1 });
progressStatsSchema.index({ challengesWon: -1 });
progressStatsSchema.index({ currentLevel: -1 });

const progressMilestoneSchema = new Schema<IProgressMilestone>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    milestoneType: {
      type: String,
      enum: [
        'first_lesson',
        '10_lessons',
        '100_lessons',
        'first_course',
        '10_courses',
        '7_day_streak',
        '30_day_streak',
        '100_day_streak',
        'level_10',
        'level_50',
        '1000_xp',
        '10000_xp',
      ],
      required: true,
    },
    achievedAt: {
      type: Date,
      default: Date.now,
    },
    shared: {
      type: Boolean,
      default: false,
    },
    sharedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate milestones
progressMilestoneSchema.index({ userId: 1, milestoneType: 1 }, { unique: true });

const activityFeedSchema = new Schema<IActivityFeed>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      enum: [
        'lesson_complete',
        'course_complete',
        'achievement_earned',
        'challenge_won',
        'level_up',
        'streak_milestone',
        'friend_added',
        'progress_shared',
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
      maxlength: 500,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'friends',
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

// Index for feed queries
activityFeedSchema.index({ userId: 1, createdAt: -1 });
activityFeedSchema.index({ visibility: 1, isActive: 1, createdAt: -1 });

export const ProgressShare = model<IProgressShare>('ProgressShare', progressShareSchema);
export const ProgressStats = model<IProgressStats>('ProgressStats', progressStatsSchema);
export const ProgressMilestone = model<IProgressMilestone>(
  'ProgressMilestone',
  progressMilestoneSchema
);
export const ActivityFeed = model<IActivityFeed>('ActivityFeed', activityFeedSchema);

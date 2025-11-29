import { Schema, model } from 'mongoose';
import { IChallenge, IChallengeProgress, IUserChallenge } from './challenge.types';

// Challenge Schema
const challengeSchema = new Schema<IChallenge>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['lesson', 'quiz', 'flashcard', 'streak', 'custom'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    xpReward: {
      type: Number,
      required: true,
      min: 0,
    },
    coinsReward: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    requirements: {
      type: {
        type: String,
        required: true,
      },
      target: {
        type: Number,
        required: true,
        min: 1,
      },
    },
    targetLesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    targetQuiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
challengeSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
challengeSchema.index({ type: 1, difficulty: 1 });
challengeSchema.index({ createdBy: 1 });

// Challenge Progress Schema
const challengeProgressSchema = new Schema<IChallengeProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    challenge: {
      type: Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'failed'],
      default: 'not_started',
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
challengeProgressSchema.index({ user: 1, challenge: 1 }, { unique: true });
challengeProgressSchema.index({ user: 1, status: 1 });

// User Challenge Schema (for friend challenges)
const userChallengeSchema = new Schema<IUserChallenge>(
  {
    challenger: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    opponent: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    challenge: {
      type: Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed'],
      default: 'pending',
    },
    challengerProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    opponentProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userChallengeSchema.index({ challenger: 1, status: 1 });
userChallengeSchema.index({ opponent: 1, status: 1 });
userChallengeSchema.index({ status: 1, expiresAt: 1 });

export const Challenge = model<IChallenge>('Challenge', challengeSchema);
export const ChallengeProgress = model<IChallengeProgress>('ChallengeProgress', challengeProgressSchema);
export const UserChallenge = model<IUserChallenge>('UserChallenge', userChallengeSchema);

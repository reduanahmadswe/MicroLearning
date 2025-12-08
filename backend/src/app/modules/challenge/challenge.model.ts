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
      enum: ['lesson', 'quiz', 'flashcard', 'streak', 'custom', 'multiplayer', 'daily', 'weekly', 'special'],
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
    activities: [
      {
        type: {
          type: String,
          enum: ['quiz', 'lesson', 'flashcard'],
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: String,
        points: {
          type: Number,
          required: true,
          min: 1,
        },
        target: {
          type: Schema.Types.ObjectId,
          refPath: 'activities.type',
        },
        targetQuiz: {
          type: Schema.Types.ObjectId,
          ref: 'Quiz',
        },
        targetLesson: {
          type: Schema.Types.ObjectId,
          ref: 'Lesson',
        },
        targetFlashcard: {
          type: Schema.Types.ObjectId,
          ref: 'Flashcard',
        },
        requiredScore: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalPoints: {
      type: Number,
      required: true,
      default: 0,
    },
    completionThreshold: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    // Quiz Battle specific fields
    questions: [
      {
        question: {
          type: String,
          required: function(this: any) {
            return this.type === 'multiplayer';
          },
        },
        options: {
          type: [String],
          required: function(this: any) {
            return this.type === 'multiplayer';
          },
          validate: {
            validator: function(v: string[]) {
              return v && v.length >= 2 && v.length <= 6;
            },
            message: 'Options must have 2-6 choices',
          },
        },
        correctAnswer: {
          type: Number,
          required: function(this: any) {
            return this.type === 'multiplayer';
          },
          min: 0,
        },
        points: {
          type: Number,
          default: 10,
          min: 1,
        },
        timeLimit: {
          type: Number,
          default: 30,
        },
      },
    ],
    maxPlayers: {
      type: Number,
      default: 4,
      min: 2,
      max: 10,
    },
    minPlayers: {
      type: Number,
      default: 2,
      min: 2,
    },
    timeLimit: {
      type: Number,
      default: 300,
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
    pointsEarned: {
      type: Number,
      default: 0,
    },
    activityCompletions: [
      {
        activityIndex: {
          type: Number,
          required: true,
        },
        activityType: {
          type: String,
          enum: ['quiz', 'lesson', 'flashcard'],
          required: true,
        },
        pointsEarned: {
          type: Number,
          required: true,
        },
        score: Number,
        completedAt: {
          type: Date,
          default: Date.now,
        },
        targetId: Schema.Types.ObjectId,
      },
    ],
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

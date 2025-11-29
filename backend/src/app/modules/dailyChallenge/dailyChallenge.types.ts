import { Types } from 'mongoose';

export interface IDailyChallenge {
  _id: Types.ObjectId;
  challengeType: 'lesson_completion' | 'quiz_score' | 'study_time' | 'streak_maintain' | 'flashcard_review' | 'forum_participation' | 'video_watch' | 'custom';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  target: number; // e.g., complete 3 lessons, score 80%, study 30 mins
  requirement: {
    lessonCount?: number;
    quizScore?: number;
    studyTimeMinutes?: number;
    streakDays?: number;
    flashcardCount?: number;
    forumPosts?: number;
    videoWatchTime?: number;
    customCondition?: string;
  };
  rewards: {
    xp: number;
    coins?: number;
    badgeId?: Types.ObjectId;
    itemId?: Types.ObjectId;
  };
  availableDate: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDailyChallengeProgress {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  challengeId: Types.ObjectId;
  progress: number;
  target: number;
  isCompleted: boolean;
  completedAt?: Date;
  rewardsClaimed: boolean;
  claimedAt?: Date;
  metadata: {
    lessonsCompleted?: string[];
    quizzesTaken?: string[];
    studySessionIds?: string[];
    flashcardsReviewed?: string[];
    forumPostIds?: string[];
    videosWatched?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IDailyChallengeReward {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  challengeId: Types.ObjectId;
  rewardType: 'xp' | 'coins' | 'badge' | 'item';
  amount?: number;
  badgeId?: Types.ObjectId;
  itemId?: Types.ObjectId;
  claimed: boolean;
  claimedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface IDailyChallengeStreak {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Date;
  totalChallengesCompleted: number;
  streakBonusMultiplier: number; // 1.0 = no bonus, 1.5 = 50% bonus, etc.
  milestones: {
    streakDays: number;
    achievedAt: Date;
    bonusRewards: {
      xp?: number;
      coins?: number;
      badgeId?: Types.ObjectId;
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IWeeklyChallenge {
  _id: Types.ObjectId;
  challengeType: 'total_lessons' | 'total_quizzes' | 'total_study_time' | 'course_completion' | 'forum_engagement' | 'video_completion' | 'custom';
  title: string;
  description: string;
  difficulty: 'medium' | 'hard' | 'extreme';
  target: number;
  requirement: {
    lessonCount?: number;
    quizCount?: number;
    studyTimeMinutes?: number;
    courseCount?: number;
    forumEngagement?: number;
    videoCount?: number;
    customCondition?: string;
  };
  rewards: {
    xp: number;
    coins?: number;
    badgeId?: Types.ObjectId;
    itemId?: Types.ObjectId;
    exclusiveContent?: boolean;
  };
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWeeklyChallengeProgress {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  challengeId: Types.ObjectId;
  progress: number;
  target: number;
  isCompleted: boolean;
  completedAt?: Date;
  rewardsClaimed: boolean;
  claimedAt?: Date;
  rank?: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDailyChallengeInput {
  challengeType: IDailyChallenge['challengeType'];
  title: string;
  description: string;
  difficulty: IDailyChallenge['difficulty'];
  target: number;
  requirement: IDailyChallenge['requirement'];
  rewards: IDailyChallenge['rewards'];
  availableDate?: Date;
  expiresAt?: Date;
}

export interface CreateWeeklyChallengeInput {
  challengeType: IWeeklyChallenge['challengeType'];
  title: string;
  description: string;
  difficulty: IWeeklyChallenge['difficulty'];
  target: number;
  requirement: IWeeklyChallenge['requirement'];
  rewards: IWeeklyChallenge['rewards'];
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateChallengeProgressInput {
  challengeId: string;
  progressIncrement: number;
  metadata?: Record<string, any>;
}

export interface ClaimRewardsInput {
  challengeId: string;
}

export interface GetActiveChallengesQuery {
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
  challengeType?: string;
  limit?: number;
  skip?: number;
}

export interface GetChallengeHistoryQuery {
  status?: 'completed' | 'in-progress' | 'failed';
  limit?: number;
  skip?: number;
}

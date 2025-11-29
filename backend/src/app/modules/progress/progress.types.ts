import { Types } from 'mongoose';

export interface IProgressShare {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  shareType: 'achievement' | 'streak' | 'course_complete' | 'challenge_win' | 'level_up' | 'custom';
  title: string;
  description: string;
  metadata: {
    achievementId?: Types.ObjectId;
    courseId?: Types.ObjectId;
    challengeId?: Types.ObjectId;
    streakDays?: number;
    level?: number;
    xpGained?: number;
    customImage?: string;
  };
  visibility: 'public' | 'friends' | 'private';
  reactions: {
    userId: Types.ObjectId;
    reactionType: 'like' | 'love' | 'celebrate' | 'clap' | 'fire';
    createdAt: Date;
  }[];
  comments: {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  shareCount: number;
  viewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgressStats {
  userId: Types.ObjectId;
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  completedLessons: number;
  completedCourses: number;
  totalStudyTime: number; // in minutes
  achievementsCount: number;
  challengesWon: number;
  rank: number;
  lastUpdated: Date;
}

export interface ILeaderboard {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time';
  category: 'xp' | 'streak' | 'lessons' | 'challenges';
  entries: {
    userId: Types.ObjectId;
    rank: number;
    value: number;
    change: number; // rank change from previous period
  }[];
  generatedAt: Date;
}

export interface IProgressMilestone {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  milestoneType: 'first_lesson' | '10_lessons' | '100_lessons' | 'first_course' | '10_courses' | '7_day_streak' | '30_day_streak' | '100_day_streak' | 'level_10' | 'level_50' | '1000_xp' | '10000_xp';
  achievedAt: Date;
  shared: boolean;
  sharedAt?: Date;
}

export interface ICompareProgress {
  user1: {
    userId: Types.ObjectId;
    username: string;
    stats: Partial<IProgressStats>;
  };
  user2: {
    userId: Types.ObjectId;
    username: string;
    stats: Partial<IProgressStats>;
  };
  comparison: {
    category: string;
    user1Value: number;
    user2Value: number;
    difference: number;
    leader: 'user1' | 'user2' | 'tie';
  }[];
}

export interface IActivityFeed {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  activityType: 'lesson_complete' | 'course_complete' | 'achievement_earned' | 'challenge_won' | 'level_up' | 'streak_milestone' | 'friend_added' | 'progress_shared';
  title: string;
  description: string;
  metadata: Record<string, any>;
  visibility: 'public' | 'friends' | 'private';
  isActive: boolean;
  createdAt: Date;
}

export interface CreateProgressShareInput {
  shareType: IProgressShare['shareType'];
  title: string;
  description: string;
  metadata: IProgressShare['metadata'];
  visibility: IProgressShare['visibility'];
}

export interface UpdateProgressShareInput {
  title?: string;
  description?: string;
  visibility?: IProgressShare['visibility'];
  isActive?: boolean;
}

export interface AddReactionInput {
  reactionType: 'like' | 'love' | 'celebrate' | 'clap' | 'fire';
}

export interface AddCommentInput {
  content: string;
}

export interface GetProgressFeedQuery {
  visibility?: 'public' | 'friends' | 'private';
  shareType?: IProgressShare['shareType'];
  userId?: string;
  limit?: number;
  skip?: number;
}

export interface GetLeaderboardQuery {
  timeframe: ILeaderboard['timeframe'];
  category: ILeaderboard['category'];
  limit?: number;
}

export interface UpdateProgressStatsInput {
  xpGained?: number;
  lessonCompleted?: boolean;
  courseCompleted?: boolean;
  studyTimeMinutes?: number;
  challengeWon?: boolean;
}

export interface GetActivityFeedQuery {
  userId?: string;
  activityType?: IActivityFeed['activityType'];
  visibility?: 'public' | 'friends' | 'private';
  limit?: number;
  skip?: number;
}

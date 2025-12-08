import { Types } from 'mongoose';

export interface IChallengeActivity {
  type: 'quiz' | 'lesson' | 'flashcard';
  title: string;
  description?: string;
  points: number;
  targetQuiz?: Types.ObjectId;
  targetLesson?: Types.ObjectId;
  targetFlashcard?: Types.ObjectId;
  requiredScore?: number;
}

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  timeLimit?: number;
}

export interface IChallenge {
  _id: Types.ObjectId;
  title: string;
  description: string;
  type: 'lesson' | 'quiz' | 'flashcard' | 'streak' | 'custom' | 'multiplayer' | 'daily' | 'weekly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  coinsReward?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  requirements: {
    type: string;
    target: number;
    currentProgress?: number;
  };
  targetLesson?: Types.ObjectId;
  targetQuiz?: Types.ObjectId;
  createdBy: Types.ObjectId;
  activities?: IChallengeActivity[];
  totalPoints?: number;
  completionThreshold?: number;
  // Quiz Battle specific fields
  questions?: IQuizQuestion[];
  maxPlayers?: number;
  minPlayers?: number;
  timeLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityCompletion {
  activityIndex: number;
  activityType: 'quiz' | 'lesson' | 'flashcard';
  pointsEarned: number;
  score?: number;
  completedAt: Date;
  targetId?: Types.ObjectId;
}

export interface IChallengeProgress {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  challenge: Types.ObjectId;
  progress: number; // 0-100
  pointsEarned?: number;
  activityCompletions?: IActivityCompletion[];
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserChallenge {
  _id: Types.ObjectId;
  challenger: Types.ObjectId;
  opponent: Types.ObjectId;
  challenge: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed';
  challengerProgress: number;
  opponentProgress: number;
  winner?: Types.ObjectId;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateChallengeRequest {
  title: string;
  description: string;
  type: 'lesson' | 'quiz' | 'flashcard' | 'streak' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  coinsReward?: number;
  startDate: Date;
  endDate: Date;
  requirements: {
    type: string;
    target: number;
  };
  targetLesson?: string;
  targetQuiz?: string;
}

export interface IChallengeStats {
  totalChallenges: number;
  completedChallenges: number;
  inProgressChallenges: number;
  failedChallenges: number;
  totalXpEarned: number;
  totalCoinsEarned: number;
  completionRate: number;
}

export interface IDailyChallengeResponse {
  dailyChallenge: IChallenge | null;
  progress: IChallengeProgress | null;
  isCompleted: boolean;
}

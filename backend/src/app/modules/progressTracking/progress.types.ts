import mongoose from 'mongoose';

export interface IUserProgress {
  user: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number; // 0-100
  timeSpent: number; // in seconds
  lastAccessed: Date;
  completedAt?: Date;
  mastery: number; // 0-100 (understanding level)
  attempts: number;
  score?: number; // Quiz score if applicable
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateProgressRequest {
  lessonId: string;
  progress: number;
  timeSpent: number;
  status?: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  mastery?: number;
}

export interface IProgressStats {
  totalLessonsStarted: number;
  totalLessonsCompleted: number;
  totalTimeSpent: number; // in minutes
  averageMastery: number;
  currentStreak: number;
  longestStreak: number;
  xpEarned: number;
  level: number;
}

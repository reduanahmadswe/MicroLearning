import mongoose from 'mongoose';

export interface IBadge {
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: 'streak' | 'lessons_completed' | 'quiz_perfect' | 'xp_milestone' | 'flashcard_mastered' | 'topic_mastered';
    threshold: number;
    topic?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserAchievement {
  user: mongoose.Types.ObjectId;
  badge: mongoose.Types.ObjectId;
  progress: number;
  isCompleted: boolean;
  earnedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

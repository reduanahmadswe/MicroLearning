import mongoose from 'mongoose';

export interface ICourseLesson {
  lesson: mongoose.Types.ObjectId;
  order: number;
  isOptional: boolean;
}

export interface ICourse {
  title: string;
  description: string;
  author: mongoose.Types.ObjectId;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnailUrl?: string;
  lessons: ICourseLesson[];
  estimatedDuration: number; // total minutes
  isPremium: boolean;
  price?: number;
  enrolledCount: number;
  rating: number;
  ratingCount: number;
  isPublished: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCourseRequest {
  title: string;
  description: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnailUrl?: string;
  lessons: {
    lesson: string;
    order: number;
    isOptional?: boolean;
  }[];
  isPremium?: boolean;
  price?: number;
}

export interface IEnrollment {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  progress: number; // 0-100
  completedLessons: mongoose.Types.ObjectId[];
  lastAccessedLesson?: mongoose.Types.ObjectId;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

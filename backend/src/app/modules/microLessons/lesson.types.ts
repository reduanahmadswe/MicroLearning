import mongoose from 'mongoose';

export interface IMedia {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  title?: string;
  duration?: number; // in seconds for video/audio
}

export interface ILesson {
  title: string;
  description: string;
  content: string;
  topic: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  
  // Media
  media: IMedia[];
  thumbnailUrl?: string;
  
  // AI Generated
  aiSummary?: string;
  keyPoints: string[];
  aiGenerated: boolean;
  
  // Metadata
  author: mongoose.Types.ObjectId; // User ID
  course?: mongoose.Types.ObjectId; // Course ID
  order: number;
  requiredQuizScore: number;
  isPublished: boolean;
  isPremium: boolean;
  views: number;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  completions: number;
  
  // SEO
  slug?: string;
  metaDescription?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateLessonRequest {
  title: string;
  description: string;
  content: string;
  topic: string;
  tags?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  media?: IMedia[];
  thumbnailUrl?: string;
  keyPoints?: string[];
  isPremium?: boolean;
}

export interface IGenerateLessonRequest {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number;
  preferences?: {
    includeExamples?: boolean;
    includeQuiz?: boolean;
    learningStyle?: 'visual' | 'auditory' | 'kinesthetic';
  };
}

export interface ILessonFilterQuery {
  course?: string;
  topic?: string;
  difficulty?: string;
  duration?: string; // "1-5" or "5-10"
  tags?: string;
  isPremium?: string;
  author?: string;
  search?: string;
}

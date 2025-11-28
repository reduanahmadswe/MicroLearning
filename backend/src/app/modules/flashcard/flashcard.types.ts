import mongoose from 'mongoose';

export interface IFlashcard {
  front: string;
  back: string;
  hint?: string;
  
  // Associated content
  lesson?: mongoose.Types.ObjectId;
  topic: string;
  
  // SRS data
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  lastReviewedAt?: Date;
  
  // Ownership
  user: mongoose.Types.ObjectId;
  isPublic: boolean;
  
  // Media
  frontImage?: string;
  backImage?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewFlashcardRequest {
  flashcardId: string;
  quality: number; // 0-5 (SM-2 quality rating)
}

export interface ICreateFlashcardRequest {
  front: string;
  back: string;
  hint?: string;
  lesson?: string;
  topic: string;
  isPublic?: boolean;
  frontImage?: string;
  backImage?: string;
}

export interface IGenerateFlashcardsRequest {
  lessonId: string;
  count?: number;
}

export interface ISRSResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
}

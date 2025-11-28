import mongoose from 'mongoose';

export interface IQuizQuestion {
  type: 'mcq' | 'true-false' | 'fill-blank';
  question: string;
  options?: string[]; // For MCQ
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface IQuiz {
  title: string;
  description: string;
  lesson?: mongoose.Types.ObjectId;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: IQuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  
  // Metadata
  author: mongoose.Types.ObjectId;
  isPublished: boolean;
  isPremium: boolean;
  attempts: number;
  averageScore: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizAttempt {
  user: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  answers: {
    questionIndex: number;
    answer: string | string[];
    isCorrect: boolean;
    points: number;
  }[];
  score: number; // percentage
  totalPoints: number;
  earnedPoints: number;
  timeTaken: number; // in seconds
  passed: boolean;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateQuizRequest {
  title: string;
  description: string;
  lesson?: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: IQuizQuestion[];
  timeLimit?: number;
  passingScore?: number;
  isPremium?: boolean;
}

export interface IGenerateQuizRequest {
  topic: string;
  lessonId?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionCount?: number;
  questionTypes?: ('mcq' | 'true-false' | 'fill-blank')[];
}

export interface ISubmitQuizRequest {
  quizId: string;
  answers: {
    questionIndex: number;
    answer: string | string[];
  }[];
  timeTaken: number;
}

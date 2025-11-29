import { Document, Types } from 'mongoose';

/**
 * AI Provider Configuration
 */
export type AIProvider = 'openai' | 'claude' | 'gemini';

export interface IAIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * AI Lesson Generation Types
 */
export interface IGenerateLessonRequest {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  duration?: number; // minutes
  includeSummary?: boolean;
  includeExamples?: boolean;
  targetAudience?: string;
}

export interface IGeneratedLesson {
  title: string;
  content: string;
  summary?: string;
  examples?: string[];
  keyPoints: string[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  metadata: {
    topic: string;
    generatedBy: AIProvider;
    generatedAt: Date;
    tokens: number;
  };
}

/**
 * AI Quiz Generation Types
 */
export interface IGenerateQuizRequest {
  topic: string;
  lessonContent?: string;
  numberOfQuestions: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionTypes?: ('multiple-choice' | 'true-false' | 'short-answer')[];
  language?: string;
}

export interface IGeneratedQuestion {
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[]; // For multiple-choice
  correctAnswer: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
}

export interface IGeneratedQuiz {
  title: string;
  description: string;
  questions: IGeneratedQuestion[];
  totalPoints: number;
  estimatedDuration: number;
  metadata: {
    topic: string;
    generatedBy: AIProvider;
    generatedAt: Date;
    tokens: number;
  };
}

/**
 * AI Flashcard Generation Types
 */
export interface IGenerateFlashcardRequest {
  topic: string;
  lessonContent?: string;
  numberOfCards: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  includeExamples?: boolean;
  language?: string;
}

export interface IGeneratedFlashcard {
  front: string;
  back: string;
  example?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface IGeneratedFlashcardSet {
  title: string;
  description: string;
  cards: IGeneratedFlashcard[];
  metadata: {
    topic: string;
    generatedBy: AIProvider;
    generatedAt: Date;
    tokens: number;
  };
}

/**
 * AI Chat Tutor Types
 */
export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  messages: IChatMessage[];
  context?: {
    lesson?: Types.ObjectId;
    quiz?: Types.ObjectId;
    topic?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatRequest {
  message: string;
  sessionId?: string;
  context?: {
    lessonId?: string;
    quizId?: string;
    topic?: string;
  };
}

export interface IChatResponse {
  message: string;
  sessionId: string;
  suggestions?: string[];
  relatedTopics?: string[];
  metadata: {
    tokens: number;
    provider: AIProvider;
  };
}

/**
 * AI Generation History Types
 */
export interface IAIGenerationHistory extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: 'lesson' | 'quiz' | 'flashcard' | 'chat';
  request: any;
  response: any;
  provider: AIProvider;
  aiModel: string;
  tokensUsed: number;
  cost: number;
  status: 'success' | 'failed' | 'pending';
  error?: string;
  createdAt: Date;
}

/**
 * AI Stats Types
 */
export interface IAIStats {
  totalGenerations: number;
  byType: {
    lesson: number;
    quiz: number;
    flashcard: number;
    chat: number;
  };
  totalTokensUsed: number;
  totalCost: number;
  averageResponseTime: number;
  successRate: number;
}

/**
 * AI Content Improvement Types
 */
export interface IImproveContentRequest {
  content: string;
  contentType: 'lesson' | 'quiz' | 'flashcard';
  improvementType: 'clarity' | 'grammar' | 'structure' | 'simplify' | 'expand';
  targetAudience?: string;
}

export interface IImprovedContent {
  originalContent: string;
  improvedContent: string;
  changes: string[];
  suggestions: string[];
  metadata: {
    improvementType: string;
    generatedBy: AIProvider;
    tokens: number;
  };
}

/**
 * AI Topic Suggestion Types
 */
export interface ITopicSuggestionRequest {
  userInterests?: string[];
  completedLessons?: string[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  limit?: number;
}

export interface ITopicSuggestion {
  topic: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  prerequisites?: string[];
  relevanceScore: number;
  reason: string;
}

/**
 * OpenAI Specific Types
 */
export interface IOpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface IOpenAIRequest {
  model: string;
  messages: IOpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface IOpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

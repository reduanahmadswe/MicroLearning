import { Schema, model } from 'mongoose';
import { IChatSession, IAIGenerationHistory } from './ai.types';

/**
 * Chat Session Schema
 */
const chatMessageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatSessionSchema = new Schema<IChatSession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'New Chat',
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
    context: {
      lesson: {
        type: Schema.Types.ObjectId,
        ref: 'MicroLesson',
      },
      quiz: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
      },
      topic: {
        type: String,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
chatSessionSchema.index({ user: 1, isActive: 1 });
chatSessionSchema.index({ createdAt: -1 });
chatSessionSchema.index({ 'context.lesson': 1 });
chatSessionSchema.index({ 'context.quiz': 1 });

/**
 * AI Generation History Schema
 */
const aiGenerationHistorySchema = new Schema<IAIGenerationHistory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['lesson', 'quiz', 'flashcard', 'chat'],
      required: true,
      index: true,
    },
    request: {
      type: Schema.Types.Mixed,
      required: true,
    },
    response: {
      type: Schema.Types.Mixed,
    },
    provider: {
      type: String,
      enum: ['openai', 'openrouter', 'deepseek', 'claude', 'gemini'],
      required: true,
      default: 'openrouter',
    },
    aiModel: {
      type: String,
      required: true,
    },
    tokensUsed: {
      type: Number,
      required: true,
      default: 0,
    },
    cost: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      required: true,
      default: 'pending',
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics and history
aiGenerationHistorySchema.index({ user: 1, type: 1 });
aiGenerationHistorySchema.index({ createdAt: -1 });
aiGenerationHistorySchema.index({ status: 1 });
aiGenerationHistorySchema.index({ provider: 1, model: 1 });

export const ChatSession = model<IChatSession>('ChatSession', chatSessionSchema);
export const AIGenerationHistory = model<IAIGenerationHistory>(
  'AIGenerationHistory',
  aiGenerationHistorySchema
);

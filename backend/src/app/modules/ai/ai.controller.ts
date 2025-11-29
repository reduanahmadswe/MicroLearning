import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import * as AIService from './ai.service';
import { Types } from 'mongoose';

/**
 * Generate Lesson with AI
 */
export const generateLesson = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const result = await AIService.generateLesson(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'AI lesson generated successfully',
    data: result,
  });
});

/**
 * Generate Quiz with AI
 */
export const generateQuiz = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const result = await AIService.generateQuiz(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'AI quiz generated successfully',
    data: result,
  });
});

/**
 * Generate Flashcards with AI
 */
export const generateFlashcards = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const result = await AIService.generateFlashcards(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'AI flashcards generated successfully',
    data: result,
  });
});

/**
 * Chat with AI Tutor
 */
export const chat = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const result = await AIService.chat(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AI response generated successfully',
    data: result,
  });
});

/**
 * Get Chat Sessions
 */
export const getChatSessions = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await AIService.getChatSessions(userId, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat sessions retrieved successfully',
    data: result.sessions,
    meta: {
      page: result.pagination.currentPage,
      limit: result.pagination.itemsPerPage,
      total: result.pagination.totalItems,
    },
  });
});

/**
 * Get Chat Session Details
 */
export const getChatSessionDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const { sessionId } = req.params;

  const result = await AIService.getChatSessionDetails(userId, sessionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat session details retrieved successfully',
    data: result,
  });
});

/**
 * Delete Chat Session
 */
export const deleteChatSession = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const { sessionId } = req.params;

  const result = await AIService.deleteChatSession(userId, sessionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

/**
 * Improve Content with AI
 */
export const improveContent = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const result = await AIService.improveContent(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Content improved successfully',
    data: result,
  });
});

/**
 * Get Topic Suggestions
 */
export const getTopicSuggestions = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const skillLevel = req.query.skillLevel as 'beginner' | 'intermediate' | 'advanced' | undefined;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await AIService.getTopicSuggestions(userId, { skillLevel, limit });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Topic suggestions retrieved successfully',
    data: result,
  });
});

/**
 * Get AI Statistics
 */
export const getAIStats = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const result = await AIService.getAIStats(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AI statistics retrieved successfully',
    data: result,
  });
});

/**
 * Get Generation History
 */
export const getGenerationHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const type = req.query.type as 'lesson' | 'quiz' | 'flashcard' | 'chat' | undefined;
  const status = req.query.status as 'success' | 'failed' | 'pending' | undefined;

  const result = await AIService.getGenerationHistory(userId, page, limit, type, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Generation history retrieved successfully',
    data: result.history,
    meta: {
      page: result.pagination.currentPage,
      limit: result.pagination.itemsPerPage,
      total: result.pagination.totalItems,
    },
  });
});

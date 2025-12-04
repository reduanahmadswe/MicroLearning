import { Request, Response } from 'express';
import { Types } from 'mongoose';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { aiTutorService } from './aiTutor.service';

/**
 * Chat with AI Tutor
 */
export const chat = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const result = await aiTutorService.chat(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AI Tutor response generated successfully',
    data: result,
  });
});

/**
 * Get user's chat sessions
 */
export const getUserSessions = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await aiTutorService.getUserSessions(userId, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sessions retrieved successfully',
    data: result.sessions,
    meta: {
      page: result.page,
      limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

/**
 * Get session by ID
 */
export const getSession = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const { sessionId } = req.params;

  const result = await aiTutorService.getSession(userId, sessionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Session retrieved successfully',
    data: result,
  });
});

/**
 * Delete session
 */
export const deleteSession = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const { sessionId } = req.params;

  const result = await aiTutorService.deleteSession(userId, sessionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

/**
 * Update session title
 */
export const updateSessionTitle = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const { sessionId } = req.params;
  const { title } = req.body;

  const result = await aiTutorService.updateSessionTitle(userId, sessionId, title);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Session title updated successfully',
    data: result,
  });
});

/**
 * Clear session messages
 */
export const clearSession = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const { sessionId } = req.params;

  const result = await aiTutorService.clearSession(userId, sessionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

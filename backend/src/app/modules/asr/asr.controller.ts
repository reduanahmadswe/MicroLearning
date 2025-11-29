import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import * as ASRService from './asr.service';
import { Types } from 'mongoose';

/**
 * Transcribe Audio
 */
export const transcribeAudio = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const result = await ASRService.transcribeAudio(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audio transcribed successfully',
    data: result,
  });
});

/**
 * Translate Audio
 */
export const translateAudio = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const result = await ASRService.translateAudio(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audio translated successfully',
    data: result,
  });
});

/**
 * Get Transcription History
 */
export const getTranscriptionHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const { page, limit, language, lessonId } = req.query;

  const result = await ASRService.getTranscriptionHistory(
    userId,
    page ? parseInt(page as string) : 1,
    limit ? parseInt(limit as string) : 20,
    language as string,
    lessonId as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transcription history retrieved successfully',
    data: result.items,
    meta: {
      page: result.pagination.currentPage,
      limit: result.pagination.itemsPerPage,
      total: result.pagination.totalItems,
    },
  });
});

/**
 * Get Transcription by ID
 */
export const getTranscriptionById = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const { transcriptionId } = req.params;

  const result = await ASRService.getTranscriptionById(userId, transcriptionId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transcription retrieved successfully',
    data: result,
  });
});

/**
 * Delete Transcription
 */
export const deleteTranscription = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const { transcriptionId } = req.params;

  const result = await ASRService.deleteTranscription(userId, transcriptionId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
  });
});

/**
 * Get ASR Statistics
 */
export const getASRStats = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const result = await ASRService.getASRStats(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ASR statistics retrieved successfully',
    data: result,
  });
});

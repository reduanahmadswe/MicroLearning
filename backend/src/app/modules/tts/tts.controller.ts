import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import * as TTSService from './tts.service';
import { Types } from 'mongoose';

/**
 * Generate Speech
 */
export const generateSpeech = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const result = await TTSService.generateSpeech(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Speech generated successfully',
    data: result,
  });
});

/**
 * Get TTS Library
 */
export const getTTSLibrary = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const { page, limit, voice, lessonId } = req.query;

  const result = await TTSService.getTTSLibrary(
    userId,
    page ? parseInt(page as string) : 1,
    limit ? parseInt(limit as string) : 20,
    voice as any,
    lessonId as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TTS library retrieved successfully',
    data: result.items,
    meta: {
      page: result.pagination.currentPage,
      limit: result.pagination.itemsPerPage,
      total: result.pagination.totalItems,
    },
  });
});

/**
 * Get Audio by ID
 */
export const getAudioById = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const { audioId } = req.params;

  const result = await TTSService.getAudioById(userId, audioId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audio retrieved successfully',
    data: result,
  });
});

/**
 * Delete Audio
 */
export const deleteAudio = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const { audioId } = req.params;

  const result = await TTSService.deleteAudio(userId, audioId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
  });
});

/**
 * Get TTS Statistics
 */
export const getTTSStats = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const result = await TTSService.getTTSStats(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TTS statistics retrieved successfully',
    data: result,
  });
});

/**
 * Get Voice Previews
 */
export const getVoicePreviews = catchAsync(async (req: Request, res: Response) => {
  const { voice } = req.query;
  const result = await TTSService.getVoicePreviews(voice as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Voice previews retrieved successfully',
    data: result,
  });
});

/**
 * Batch Generate Speech
 */
export const batchGenerateSpeech = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const { texts, voice, model } = req.body;

  const result = await TTSService.batchGenerateSpeech(userId, texts, voice, model);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch speech generation completed',
    data: result,
  });
});

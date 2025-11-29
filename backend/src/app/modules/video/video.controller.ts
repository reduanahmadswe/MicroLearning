import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import * as VideoService from './video.service';

/**
 * VIDEO CONTROLLERS
 */
export const createVideo = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await VideoService.createVideo(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Video created successfully',
    data: result,
  });
});

export const getVideos = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    query: req.query.query as string,
    lessonId: req.query.lessonId as string,
    uploaderId: req.query.uploaderId as string,
    tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    minDuration: req.query.minDuration ? parseInt(req.query.minDuration as string) : undefined,
    maxDuration: req.query.maxDuration ? parseInt(req.query.maxDuration as string) : undefined,
    status: req.query.status as 'processing' | 'ready' | 'failed',
    isPublic: req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined,
    sortBy: (req.query.sortBy as 'recent' | 'popular' | 'duration') || 'recent',
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await VideoService.getVideos(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Videos retrieved successfully',
    data: result.videos,
    meta: {
      page: result.pagination.currentPage,
      limit: result.pagination.itemsPerPage,
      total: result.pagination.totalItems,
    },
  });
});

export const getVideoDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await VideoService.getVideoDetails(req.params.videoId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Video details retrieved successfully',
    data: result,
  });
});

export const updateVideo = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await VideoService.updateVideo(req.params.videoId, userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Video updated successfully',
    data: result,
  });
});

export const deleteVideo = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await VideoService.deleteVideo(req.params.videoId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

export const updateVideoStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await VideoService.updateVideoStatus(req.params.videoId, userId, req.body.status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Video status updated successfully',
    data: result,
  });
});

export const addVideoQuality = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await VideoService.addVideoQuality(req.params.videoId, userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Video quality added successfully',
    data: result,
  });
});

export const addSubtitle = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await VideoService.addSubtitle(req.params.videoId, userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Subtitle added successfully',
    data: result,
  });
});

export const removeSubtitle = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await VideoService.removeSubtitle(req.params.videoId, userId, req.params.languageCode);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

export const incrementViewCount = catchAsync(async (req: Request, res: Response) => {
  const result = await VideoService.incrementViewCount(req.params.videoId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'View count incremented',
    data: result,
  });
});

/**
 * PROGRESS CONTROLLERS
 */
export const updateProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await VideoService.updateProgress(req.params.videoId, userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Progress updated successfully',
    data: result,
  });
});

export const getUserProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await VideoService.getUserProgress(req.params.videoId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Progress retrieved successfully',
    data: result,
  });
});

export const getUserProgressByLesson = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await VideoService.getUserProgressByLesson(req.params.lessonId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Lesson progress retrieved successfully',
    data: result,
  });
});

export const getAllUserProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const result = await VideoService.getAllUserProgress(userId, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All progress retrieved successfully',
    data: result.progress,
    meta: {
      page: result.pagination.currentPage,
      limit: result.pagination.itemsPerPage,
      total: result.pagination.totalItems,
    },
  });
});

/**
 * ANALYTICS CONTROLLERS
 */
export const getVideoAnalytics = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const days = parseInt(req.query.days as string) || 30;
  const result = await VideoService.getVideoAnalytics(req.params.videoId, userId, days);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Video analytics retrieved successfully',
    data: result,
  });
});

export const getVideoStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await VideoService.getVideoStats(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Video statistics retrieved successfully',
    data: result,
  });
});

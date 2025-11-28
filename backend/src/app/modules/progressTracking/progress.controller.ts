import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import progressService from './progress.service';

class ProgressController {
  // Update progress
  updateProgress = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await progressService.updateProgress(userId, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Progress updated successfully',
      data: result,
    });
  });

  // Get lesson progress
  getLessonProgress = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { lessonId } = req.params;
    const result = await progressService.getLessonProgress(userId, lessonId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Lesson progress retrieved successfully',
      data: result,
    });
  });

  // Get user progress
  getUserProgress = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await progressService.getUserProgress(userId, page, limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User progress retrieved successfully',
      data: result.progressList,
      meta: result.pagination,
    });
  });

  // Get user statistics
  getUserStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await progressService.getUserStats(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User statistics retrieved successfully',
      data: result,
    });
  });

  // Get learning timeline
  getLearningTimeline = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const days = parseInt(req.query.days as string) || 30;
    const result = await progressService.getLearningTimeline(userId, days);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Learning timeline retrieved successfully',
      data: result,
    });
  });
}

export default new ProgressController();

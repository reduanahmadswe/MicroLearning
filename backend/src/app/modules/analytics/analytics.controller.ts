import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import analyticsService from './analytics.service';

class AnalyticsController {
  // Get user analytics
  getUserAnalytics = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await analyticsService.getUserAnalytics(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User analytics retrieved successfully',
      data: result,
    });
  });

  // Get system analytics (admin only)
  getSystemAnalytics = catchAsync(async (_req: Request, res: Response) => {
    const result = await analyticsService.getSystemAnalytics();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'System analytics retrieved successfully',
      data: result,
    });
  });

  // Get learning insights
  getLearningInsights = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await analyticsService.getLearningInsights(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Learning insights retrieved successfully',
      data: result,
    });
  });
}

export default new AnalyticsController();

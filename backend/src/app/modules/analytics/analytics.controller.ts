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

  // Admin: Get revenue analytics
  getRevenueAnalytics = catchAsync(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const result = await analyticsService.getRevenueAnalytics(
      startDate as string,
      endDate as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Revenue analytics retrieved successfully',
      data: result,
    });
  });

  // Admin: Get engagement report
  getEngagementReport = catchAsync(async (req: Request, res: Response) => {
    const { timeframe } = req.query;
    const result = await analyticsService.getEngagementReport(timeframe as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Engagement report retrieved successfully',
      data: result,
    });
  });

  // Admin: Get popular content
  getPopularContent = catchAsync(async (req: Request, res: Response) => {
    const { limit } = req.query;
    const result = await analyticsService.getPopularContent(
      limit ? parseInt(limit as string) : 10
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Popular content retrieved successfully',
      data: result,
    });
  });

  // Admin: Get learning trends
  getLearningTrends = catchAsync(async (req: Request, res: Response) => {
    const { period } = req.query;
    const result = await analyticsService.getLearningTrends(period as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Learning trends retrieved successfully',
      data: result,
    });
  });

  // Admin: Get user growth
  getUserGrowth = catchAsync(async (req: Request, res: Response) => {
    const { period } = req.query;
    const result = await analyticsService.getUserGrowth(period as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User growth data retrieved successfully',
      data: result,
    });
  });
}

export default new AnalyticsController();

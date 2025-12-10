import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import badgeService from './badge.service';

class BadgeController {
  // Create badge (admin only)
  createBadge = catchAsync(async (req: Request, res: Response) => {
    const result = await badgeService.createBadge(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Badge created successfully',
      data: result,
    });
  });

  // Get all badges
  getAllBadges = catchAsync(async (_req: Request, res: Response) => {
    const result = await badgeService.getAllBadges();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Badges retrieved successfully',
      data: result,
    });
  });

  // Get badge by ID
  getBadgeById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await badgeService.getBadgeById(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Badge retrieved successfully',
      data: result,
    });
  });

  // Get user's achievements
  getUserAchievements = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await badgeService.getUserAchievements(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Achievements retrieved successfully',
      data: result,
    });
  });

  // Get earned badges
  getEarnedBadges = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await badgeService.getEarnedBadges(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Earned badges retrieved successfully',
      data: result,
    });
  });

  // Check and award badges
  checkAndAwardBadges = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await badgeService.checkAndAwardBadges(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.length > 0 ? 'New badges earned!' : 'No new badges earned',
      data: result,
    });
  });

  // Get achievement statistics
  getAchievementStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await badgeService.getAchievementStats(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Achievement statistics retrieved successfully',
      data: result,
    });
  });

  // Initialize default badges
  initializeDefaultBadges = catchAsync(async (_req: Request, res: Response) => {
    const result = await badgeService.initializeDefaultBadges();

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Default badges initialized successfully',
      data: result,
    });
  });

  // Admin: Update badge
  updateBadge = catchAsync(async (req: Request, res: Response) => {
    const { badgeId } = req.params;
    const result = await badgeService.updateBadge(badgeId, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Badge updated successfully',
      data: result,
    });
  });

  // Admin: Delete badge
  deleteBadge = catchAsync(async (req: Request, res: Response) => {
    const { badgeId } = req.params;
    await badgeService.deleteBadge(badgeId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Badge deleted successfully',
      data: null,
    });
  });

  // Admin: Manually award badge
  manuallyAwardBadge = catchAsync(async (req: Request, res: Response) => {
    const { userId, badgeId, reason } = req.body;

    try {
      const result = await badgeService.manuallyAwardBadge(userId, badgeId, reason);

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Badge awarded successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('❌ [Award Badge] Error:', error.message);
      console.error('❌ [Award Badge] Stack:', error.stack);
      throw error;
    }
  });

  // Admin: Get all badges with statistics
  getAllBadgesAdmin = catchAsync(async (_req: Request, res: Response) => {
    const result = await badgeService.getAllBadgesWithStats();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All badges with statistics retrieved successfully',
      data: result,
    });
  });
}

export default new BadgeController();

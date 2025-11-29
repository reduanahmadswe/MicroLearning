import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import profileService from './profile.service';

class ProfileController {
  // Get my profile
  getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await profileService.getUserProfile(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Profile retrieved successfully',
      data: result,
    });
  });

  // Get public profile by ID
  getPublicProfile = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await profileService.getPublicProfile(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Public profile retrieved successfully',
      data: result,
    });
  });

  // Update my profile
  updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await profileService.updateProfile(userId, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Profile updated successfully',
      data: result,
    });
  });

  // Update my preferences
  updateMyPreferences = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await profileService.updatePreferences(userId, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Preferences updated successfully',
      data: result,
    });
  });

  // Get my badges
  getMyBadges = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await profileService.getUserBadges(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Badges retrieved successfully',
      data: result,
    });
  });

  // Get my statistics
  getMyStatistics = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await profileService.getUserStatistics(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Statistics retrieved successfully',
      data: result,
    });
  });

  // Search users
  searchUsers = catchAsync(async (req: Request, res: Response) => {
    const { query, limit } = req.query;
    const result = await profileService.searchUsers(
      query as string,
      limit ? parseInt(limit as string) : 20
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Users retrieved successfully',
      data: result,
    });
  });
}

export default new ProfileController();

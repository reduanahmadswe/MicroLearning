import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import progressService from './progress.service';

// ==================== Progress Share Controllers ====================

export const createProgressShare = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const share = await progressService.createProgressShare(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Progress shared successfully',
    data: share,
  });
});

export const getProgressShare = catchAsync(async (req: Request, res: Response) => {
  const { shareId } = req.params;
  const share = await progressService.getProgressShare(shareId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Progress share retrieved successfully',
    data: share,
  });
});

export const getProgressFeed = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await progressService.getProgressFeed(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Progress feed retrieved successfully',
    data: result.shares,
    meta: {
      total: result.pagination.total,
      page: Math.floor(result.pagination.skip / result.pagination.limit) + 1,
      limit: result.pagination.limit,
    },
  });
});

export const updateProgressShare = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { shareId } = req.params;
  const share = await progressService.updateProgressShare(shareId, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Progress share updated successfully',
    data: share,
  });
});

export const deleteProgressShare = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { shareId } = req.params;
  await progressService.deleteProgressShare(shareId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Progress share deleted successfully',
    data: null,
  });
});

export const addReaction = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { shareId } = req.params;
  const share = await progressService.addReaction(shareId, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reaction added successfully',
    data: share,
  });
});

export const removeReaction = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { shareId } = req.params;
  const share = await progressService.removeReaction(shareId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reaction removed successfully',
    data: share,
  });
});

export const addComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { shareId } = req.params;
  const share = await progressService.addComment(shareId, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment added successfully',
    data: share,
  });
});

export const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { shareId, commentId } = req.params;
  const share = await progressService.deleteComment(shareId, commentId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment deleted successfully',
    data: share,
  });
});

// ==================== Progress Stats Controllers ====================

export const getMyStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const stats = await progressService.getUserStats(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User stats retrieved successfully',
    data: stats,
  });
});

export const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const stats = await progressService.getUserStats(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User stats retrieved successfully',
    data: stats,
  });
});

export const updateMyStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const stats = await progressService.updateProgressStats(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stats updated successfully',
    data: stats,
  });
});

export const compareWithUser = catchAsync(async (req: Request, res: Response) => {
  const userId1 = req.user!.userId;
  const { userId: userId2 } = req.params;
  const comparison = await progressService.compareProgress(userId1, userId2);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Progress comparison retrieved successfully',
    data: comparison,
  });
});

// ==================== Leaderboard Controllers ====================

export const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const leaderboard = await progressService.getLeaderboard(req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Leaderboard retrieved successfully',
    data: leaderboard,
  });
});

// ==================== Milestone Controllers ====================

export const getMyMilestones = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const milestones = await progressService.getUserMilestones(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestones retrieved successfully',
    data: milestones,
  });
});

export const getUserMilestones = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const milestones = await progressService.getUserMilestones(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestones retrieved successfully',
    data: milestones,
  });
});

export const shareMilestone = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { milestoneId } = req.params;
  const { visibility } = req.body;
  const milestone = await progressService.shareMilestone(milestoneId, userId, visibility);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestone shared successfully',
    data: milestone,
  });
});

// ==================== Activity Feed Controllers ====================

export const getActivityFeed = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await progressService.getActivityFeed(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Activity feed retrieved successfully',
    data: result.activities,
    meta: {
      total: result.pagination.total,
      page: Math.floor(result.pagination.skip / result.pagination.limit) + 1,
      limit: result.pagination.limit,
    },
  });
});

export default {
  createProgressShare,
  getProgressShare,
  getProgressFeed,
  updateProgressShare,
  deleteProgressShare,
  addReaction,
  removeReaction,
  addComment,
  deleteComment,
  getMyStats,
  getUserStats,
  updateMyStats,
  compareWithUser,
  getLeaderboard,
  getMyMilestones,
  getUserMilestones,
  shareMilestone,
  getActivityFeed,
};

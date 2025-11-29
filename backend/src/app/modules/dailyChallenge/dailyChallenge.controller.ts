import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import dailyChallengeService from './dailyChallenge.service';

// ==================== Daily Challenge Controllers ====================

export const createDailyChallenge = catchAsync(async (req: Request, res: Response) => {
  const challenge = await dailyChallengeService.createDailyChallenge(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Daily challenge created successfully',
    data: challenge,
  });
});

export const getActiveDailyChallenges = catchAsync(async (req: Request, res: Response) => {
  const result = await dailyChallengeService.getActiveDailyChallenges(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Active daily challenges retrieved successfully',
    data: result.challenges,
    meta: {
      total: result.pagination.total,
      page: Math.floor(result.pagination.skip / result.pagination.limit) + 1,
      limit: result.pagination.limit,
    },
  });
});

export const getDailyChallengeById = catchAsync(async (req: Request, res: Response) => {
  const { challengeId } = req.params;
  const challenge = await dailyChallengeService.getDailyChallengeById(challengeId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Daily challenge retrieved successfully',
    data: challenge,
  });
});

export const getMyDailyChallenges = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const challenges = await dailyChallengeService.getUserDailyChallenges(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User daily challenges retrieved successfully',
    data: challenges,
  });
});

export const updateDailyChallengeProgress = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const progress = await dailyChallengeService.updateDailyChallengeProgress(
      userId,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Challenge progress updated successfully',
      data: progress,
    });
  }
);

export const claimDailyChallengeRewards = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { challengeId } = req.params;
    const result = await dailyChallengeService.claimDailyChallengeRewards(
      userId,
      challengeId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Rewards claimed successfully',
      data: result,
    });
  }
);

export const getChallengeHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await dailyChallengeService.getUserChallengeHistory(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Challenge history retrieved successfully',
    data: result.history,
    meta: {
      total: result.pagination.total,
      page: Math.floor(result.pagination.skip / result.pagination.limit) + 1,
      limit: result.pagination.limit,
    },
  });
});

// ==================== Weekly Challenge Controllers ====================

export const createWeeklyChallenge = catchAsync(async (req: Request, res: Response) => {
  const challenge = await dailyChallengeService.createWeeklyChallenge(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Weekly challenge created successfully',
    data: challenge,
  });
});

export const getActiveWeeklyChallenges = catchAsync(async (req: Request, res: Response) => {
  const result = await dailyChallengeService.getActiveWeeklyChallenges(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Active weekly challenges retrieved successfully',
    data: result.challenges,
    meta: {
      total: result.pagination.total,
      page: Math.floor(result.pagination.skip / result.pagination.limit) + 1,
      limit: result.pagination.limit,
    },
  });
});

export const getMyWeeklyChallenges = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const challenges = await dailyChallengeService.getUserWeeklyChallenges(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User weekly challenges retrieved successfully',
    data: challenges,
  });
});

export const updateWeeklyChallengeProgress = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const progress = await dailyChallengeService.updateWeeklyChallengeProgress(
      userId,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Weekly challenge progress updated successfully',
      data: progress,
    });
  }
);

export const claimWeeklyChallengeRewards = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { challengeId } = req.params;
    const result = await dailyChallengeService.claimWeeklyChallengeRewards(
      userId,
      challengeId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Weekly challenge rewards claimed successfully',
      data: result,
    });
  }
);

export const getWeeklyChallengeLeaderboard = catchAsync(
  async (req: Request, res: Response) => {
    const { challengeId } = req.params;
    const { limit } = req.query;
    const leaderboard = await dailyChallengeService.getWeeklyChallengeLeaderboard(
      challengeId,
      limit ? parseInt(limit as string) : 100
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Weekly challenge leaderboard retrieved successfully',
      data: leaderboard,
    });
  }
);

// ==================== Streak Controllers ====================

export const getMyStreak = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const streak = await dailyChallengeService.getUserStreak(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User streak retrieved successfully',
    data: streak,
  });
});

export const getUserStreak = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const streak = await dailyChallengeService.getUserStreak(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User streak retrieved successfully',
    data: streak,
  });
});

// ==================== Admin Controllers ====================

export const generateDailyChallenges = catchAsync(async (_req: Request, res: Response) => {
  const result = await dailyChallengeService.generateDailyChallenges();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

export default {
  createDailyChallenge,
  getActiveDailyChallenges,
  getDailyChallengeById,
  getMyDailyChallenges,
  updateDailyChallengeProgress,
  claimDailyChallengeRewards,
  getChallengeHistory,
  createWeeklyChallenge,
  getActiveWeeklyChallenges,
  getMyWeeklyChallenges,
  updateWeeklyChallengeProgress,
  claimWeeklyChallengeRewards,
  getWeeklyChallengeLeaderboard,
  getMyStreak,
  getUserStreak,
  generateDailyChallenges,
};

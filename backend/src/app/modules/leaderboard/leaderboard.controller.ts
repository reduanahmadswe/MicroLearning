import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import leaderboardService from './leaderboard.service';

class LeaderboardController {
  // Get global leaderboard
  getGlobalLeaderboard = catchAsync(async (req: Request, res: Response) => {
    const timeframe = (req.query.timeframe as string) || 'all-time';
    const limit = parseInt(req.query.limit as string) || 50;
    
    const result = await leaderboardService.getGlobalLeaderboard(timeframe, limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Global leaderboard retrieved successfully',
      data: result,
    });
  });

  // Get topic leaderboard
  getTopicLeaderboard = catchAsync(async (req: Request, res: Response) => {
    const { topic } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const result = await leaderboardService.getTopicLeaderboard(topic, limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `${topic} leaderboard retrieved successfully`,
      data: result,
    });
  });

  // Get user's rank
  getUserRank = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const type = (req.query.type as 'global' | 'topic') || 'global';
    const topic = req.query.topic as string;
    
    const result = await leaderboardService.getUserRank(userId, type, topic);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User rank retrieved successfully',
      data: result,
    });
  });

  // Get user's position with surrounding players
  getUserPosition = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const type = (req.query.type as 'global' | 'topic') || 'global';
    const topic = req.query.topic as string;
    
    const result = await leaderboardService.getUserPositionInLeaderboard(userId, type, topic);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User position retrieved successfully',
      data: result,
    });
  });

  // Admin: Reset leaderboard
  resetLeaderboard = catchAsync(async (req: Request, res: Response) => {
    const { type, topic } = req.body;
    await leaderboardService.resetLeaderboard(type, topic);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Leaderboard reset successfully',
      data: null,
    });
  });

  // Admin: Adjust user score
  adjustUserScore = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { xpChange, reason } = req.body;
    const result = await leaderboardService.adjustUserScore(userId, xpChange, reason);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User score adjusted successfully',
      data: result,
    });
  });

  // Admin: Get leaderboard statistics
  getLeaderboardStats = catchAsync(async (req: Request, res: Response) => {
    const result = await leaderboardService.getLeaderboardStats();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Leaderboard statistics retrieved successfully',
      data: result,
    });
  });
}

export default new LeaderboardController();

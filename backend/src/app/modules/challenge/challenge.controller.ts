import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import { ChallengeService } from './challenge.service';

// Create challenge (admin/instructor)
const createChallenge = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const result = await ChallengeService.createChallenge(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Challenge created successfully',
    data: result,
  });
});

// Get daily challenge
const getDailyChallenge = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const result = await ChallengeService.getDailyChallenge(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Daily challenge retrieved successfully',
    data: result,
  });
});

// Get all active challenges
const getActiveChallenges = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { type, difficulty, page, limit } = req.query;

  const result = await ChallengeService.getActiveChallenges(userId, {
    type: type as string,
    difficulty: difficulty as string,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Active challenges retrieved successfully',
    data: result,
  });
});

// Update challenge progress
const updateChallengeProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { challengeId } = req.params;

  const result = await ChallengeService.updateChallengeProgress(userId, challengeId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Challenge progress updated successfully',
    data: result,
  });
});

// Challenge a friend
const challengeFriend = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { opponentId, challengeId } = req.body;

  const result = await ChallengeService.challengeFriend(userId, opponentId, challengeId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Friend challenged successfully',
    data: result,
  });
});

// Respond to friend challenge
const respondToChallenge = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { userChallengeId, action } = req.body;

  const result = await ChallengeService.respondToFriendChallenge(userId, userChallengeId, action);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Challenge ${action}ed successfully`,
    data: result,
  });
});

// Get my challenges with friends
const getMyChallenges = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { status } = req.query;

  const result = await ChallengeService.getMyChallenges(userId, status as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Challenges retrieved successfully',
    data: result,
  });
});

// Get challenge statistics
const getChallengeStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const result = await ChallengeService.getChallengeStats(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Challenge statistics retrieved successfully',
    data: result,
  });
});

export const ChallengeController = {
  createChallenge,
  getDailyChallenge,
  getActiveChallenges,
  updateChallengeProgress,
  challengeFriend,
  respondToChallenge,
  getMyChallenges,
  getChallengeStats,
};

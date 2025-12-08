import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import { ChallengeService } from './challenge.service';

// Create challenge (admin/instructor)
const createChallenge = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
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
  const userId = req.user!.userId;
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
  const userId = req.user!.userId;
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
  const userId = req.user!.userId;
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
  const userId = req.user!.userId;
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
  const userId = req.user!.userId;
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
  const userId = req.user!.userId;
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
  const userId = req.user!.userId;
  const result = await ChallengeService.getChallengeStats(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Challenge statistics retrieved successfully',
    data: result,
  });
});

// Join a challenge
const joinChallenge = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { challengeId } = req.params;

  const result = await ChallengeService.joinChallenge(userId, challengeId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Successfully joined the challenge',
    data: result,
  });
});

// Admin: Get all challenges
const getAllChallengesAdmin = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, status, type } = req.query;
  const result = await ChallengeService.getAllChallengesAdmin({
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 20,
    status: status as string,
    type: type as string,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All challenges retrieved successfully',
    data: result,
  });
});

// Admin: Update challenge
const updateChallenge = catchAsync(async (req: Request, res: Response) => {
  const { challengeId } = req.params;
  const result = await ChallengeService.updateChallenge(challengeId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Challenge updated successfully',
    data: result,
  });
});

// Admin: Delete challenge
const deleteChallenge = catchAsync(async (req: Request, res: Response) => {
  const { challengeId } = req.params;
  await ChallengeService.deleteChallenge(challengeId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Challenge deleted successfully',
    data: null,
  });
});

// Admin: Create quiz battle
const createQuizBattle = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '000000000000000000000000';
  const result = await ChallengeService.createQuizBattle(req.body, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Quiz battle created successfully',
    data: result,
  });
});

// Admin: Get quiz battles
const getQuizBattles = catchAsync(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const result = await ChallengeService.getQuizBattles({
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 20,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Quiz battles retrieved successfully',
    data: result,
  });
});

// Get single quiz battle by ID
const getQuizBattleById = catchAsync(async (req: Request, res: Response) => {
  const { battleId } = req.params;
  const result = await ChallengeService.getQuizBattleById(battleId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Quiz battle retrieved successfully',
    data: result,
  });
});

// Submit activity completion
const submitActivityCompletion = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { challengeId, activityIndex } = req.params;
  const data = req.body;

  const result = await ChallengeService.submitActivityCompletion(
    userId,
    challengeId,
    parseInt(activityIndex),
    data
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Activity completed successfully',
    data: result,
  });
});

// Get challenge details with activities
const getChallengeDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { challengeId } = req.params;

  const result = await ChallengeService.getChallengeDetails(userId, challengeId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Challenge details retrieved successfully',
    data: result,
  });
});

// Respond to friend challenge
const respondToFriendChallenge = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { challengeId, response } = req.body;

  const result = await ChallengeService.respondToFriendChallenge(userId, challengeId, response);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Challenge response submitted successfully',
    data: result,
  });
});

export const ChallengeController = {
  createChallenge,
  getDailyChallenge,
  getActiveChallenges,
  updateChallengeProgress,
  challengeFriend,
  respondToFriendChallenge,
  getMyChallenges,
  getChallengeStats,
  joinChallenge,
  submitActivityCompletion,
  getChallengeDetails,
  // Admin controllers
  getAllChallengesAdmin,
  updateChallenge,
  deleteChallenge,
  createQuizBattle,
  getQuizBattles,
  getQuizBattleById,
};

import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import { FriendService } from './friend.service';

// Send friend request
const sendFriendRequest = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { friendId } = req.body;

  const result = await FriendService.sendFriendRequest(userId, friendId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Friend request sent successfully',
    data: result,
  });
});

// Get friend requests (received)
const getFriendRequests = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await FriendService.getFriendRequests(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Friend requests retrieved successfully',
    data: result,
  });
});

// Get sent requests
const getSentRequests = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await FriendService.getSentRequests(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Sent requests retrieved successfully',
    data: result,
  });
});

// Respond to friend request
const respondToRequest = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { requestId, action } = req.body;

  let result;
  if (action === 'accept') {
    result = await FriendService.acceptFriendRequest(userId, requestId);
  } else {
    result = await FriendService.rejectFriendRequest(userId, requestId);
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Friend request ${action}ed successfully`,
    data: result,
  });
});

// Get all friends
const getFriends = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await FriendService.getFriends(userId, page, limit);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Friends retrieved successfully',
    data: result,
  });
});

// Remove friend
const removeFriend = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { friendId } = req.params;

  const result = await FriendService.removeFriend(userId, friendId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
  });
});

// Block user
const blockUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { userId: blockUserId } = req.params;

  const result = await FriendService.blockUser(userId, blockUserId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User blocked successfully',
    data: result,
  });
});

// Unblock user
const unblockUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { userId: unblockUserId } = req.params;

  const result = await FriendService.unblockUser(userId, unblockUserId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
  });
});

// Get blocked users
const getBlockedUsers = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await FriendService.getBlockedUsers(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Blocked users retrieved successfully',
    data: result,
  });
});

// Get friend statistics
const getFriendStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await FriendService.getFriendStats(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Friend statistics retrieved successfully',
    data: result,
  });
});

// Get friend recommendations
const getFriendRecommendations = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await FriendService.getFriendRecommendations(userId, page, limit);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Friend recommendations retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

export const FriendController = {
  sendFriendRequest,
  getFriendRequests,
  getSentRequests,
  respondToRequest,
  getFriends,
  removeFriend,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getFriendStats,
  getFriendRecommendations,
};

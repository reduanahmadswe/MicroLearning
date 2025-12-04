import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import * as ForumService from './forum.service';

/**
 * GROUP CONTROLLERS
 */
export const createGroup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.createGroup(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Group created successfully',
    data: result,
  });
});

export const getGroups = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    query: req.query.query as string,
    category: req.query.category as string,
    tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    privacy: req.query.privacy as 'public' | 'private' | 'restricted',
    sortBy: (req.query.sortBy as 'popular' | 'recent' | 'members' | 'posts') || 'popular',
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await ForumService.getGroups(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Groups retrieved successfully',
    data: result.groups,
    meta: {
      page: result.pagination.currentPage,
      limit: result.pagination.itemsPerPage,
      total: result.pagination.totalItems,
    },
  });
});

export const getGroupDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await ForumService.getGroupDetails(req.params.groupId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Group details retrieved successfully',
    data: result,
  });
});

export const updateGroup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.updateGroup(req.params.groupId, userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Group updated successfully',
    data: result,
  });
});

export const deleteGroup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.deleteGroup(req.params.groupId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

export const joinGroup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.joinGroup(req.params.groupId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

export const leaveGroup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.leaveGroup(req.params.groupId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

export const inviteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.inviteUser(req.body.groupId, userId, req.body.userId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Invitation sent successfully',
    data: result,
  });
});

export const getUserInvitations = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.getUserInvitations(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Invitations retrieved successfully',
    data: result,
  });
});

export const respondToInvitation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.respondToInvitation(
    req.params.invitationId,
    userId,
    req.body.accept
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

export const getGroupMembers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const result = await ForumService.getGroupMembers(req.params.groupId, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Group members retrieved successfully',
    data: result.members,
    meta: {
      page: result.pagination.currentPage,
      limit: result.pagination.itemsPerPage,
      total: result.pagination.totalItems,
    },
  });
});

export const updateMemberRole = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.updateMemberRole(
    req.params.groupId,
    userId,
    req.params.userId,
    req.body.role
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

export const getGroupStats = catchAsync(async (req: Request, res: Response) => {
  const result = await ForumService.getGroupStats(req.params.groupId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Group statistics retrieved successfully',
    data: result,
  });
});

/**
 * POST CONTROLLERS
 */
export const createPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.createPost(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Post created successfully',
    data: result,
  });
});

export const getPosts = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    query: req.query.query as string,
    groupId: req.query.groupId as string,
    contentType: req.query.contentType as any,
    tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    authorId: req.query.authorId as string,
    sortBy: (req.query.sortBy as 'recent' | 'popular' | 'mostCommented' | 'unanswered') || 'recent',
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await ForumService.getPosts(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Posts retrieved successfully',
    data: result.posts,
    meta: {
      page: result.pagination.currentPage,
      limit: result.pagination.itemsPerPage,
      total: result.pagination.totalItems,
    },
  });
});

export const getPostDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await ForumService.getPostDetails(req.params.postId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Post details retrieved successfully',
    data: result,
  });
});

export const updatePost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.updatePost(req.params.postId, userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Post updated successfully',
    data: result,
  });
});

export const deletePost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.deletePost(req.params.postId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

export const togglePostLike = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.togglePostLike(req.params.postId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.liked ? 'Post liked' : 'Post unliked',
    data: result,
  });
});

export const togglePinPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.togglePinPost(req.params.postId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.isPinned ? 'Post pinned' : 'Post unpinned',
    data: result,
  });
});

export const toggleLockPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.toggleLockPost(req.params.postId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.isLocked ? 'Post locked' : 'Post unlocked',
    data: result,
  });
});

/**
 * COMMENT CONTROLLERS
 */
export const createComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.createComment(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Comment created successfully',
    data: result,
  });
});

export const getComments = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const result = await ForumService.getComments(req.params.postId, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comments retrieved successfully',
    data: result.comments,
    meta: {
      page: result.pagination.currentPage,
      limit: result.pagination.itemsPerPage,
      total: result.pagination.totalItems,
    },
  });
});

export const updateComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.updateComment(req.params.commentId, userId, req.body.content);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comment updated successfully',
    data: result,
  });
});

export const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.deleteComment(req.params.commentId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

export const toggleCommentLike = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.toggleCommentLike(req.params.commentId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.liked ? 'Comment liked' : 'Comment unliked',
    data: result,
  });
});

export const acceptAnswer = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.acceptAnswer(req.params.commentId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

/**
 * POLL CONTROLLERS
 */
export const createPoll = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.createPoll(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Poll created successfully',
    data: result,
  });
});

export const votePoll = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.votePoll(req.params.pollId, userId, req.body.optionIndex);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Vote recorded successfully',
    data: result,
  });
});

export const getPollResults = catchAsync(async (req: Request, res: Response) => {
  const result = await ForumService.getPollResults(req.params.pollId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Poll results retrieved successfully',
    data: result,
  });
});

/**
 * MODERATION CONTROLLERS
 */
export const reportPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.reportPost(req.params.postId, userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Post reported successfully',
    data: result,
  });
});

export const reportComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.reportComment(req.params.commentId, userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Comment reported successfully',
    data: result,
  });
});

/**
 * VOTING & Q&A CONTROLLERS
 */
export const votePost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { voteType } = req.body; // 'upvote' or 'downvote'
  const result = await ForumService.votePost(req.params.postId, userId, voteType);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Vote recorded successfully',
    data: result,
  });
});

export const voteComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { voteType } = req.body; // 'upvote' or 'downvote'
  const result = await ForumService.voteComment(req.params.commentId, userId, voteType);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Vote recorded successfully',
    data: result,
  });
});

export const markBestAnswer = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.markBestAnswer(req.params.postId, req.params.commentId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Best answer marked successfully',
    data: result,
  });
});

export const markPostSolved = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ForumService.markPostSolved(req.params.postId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Post marked as solved',
    data: result,
  });
});

/**
 * STATISTICS CONTROLLERS
 */
export const getForumStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await ForumService.getForumStats();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Forum statistics retrieved successfully',
    data: result,
  });
});

import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { postService } from './post.service';

// Create post
export const createPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await postService.createPost(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Post created successfully',
    data: result,
  });
});

// Get feed posts
export const getFeedPosts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await postService.getFeedPosts(userId, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Feed posts retrieved successfully',
    data: (result as any).posts,
    meta: (result as any).pagination,
  });
});

// Get user posts
export const getUserPosts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const viewerId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await postService.getUserPosts(userId, viewerId, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User posts retrieved successfully',
    data: (result as any).posts,
    meta: (result as any).pagination,
  });
});

// Get single post
export const getPostById = catchAsync(async (req: Request, res: Response) => {
  const result = await postService.getPostById(req.params.postId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Post retrieved successfully',
    data: result,
  });
});

// Update post
export const updatePost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await postService.updatePost(userId, req.params.postId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Post updated successfully',
    data: result,
  });
});

// Delete post
export const deletePost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await postService.deletePost(userId, req.params.postId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});

// Add reaction
export const addReaction = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { postId } = req.params;
  const { type } = req.body;

  const result = await postService.addReaction(userId, postId, type);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reaction added successfully',
    data: result,
  });
});

// Remove reaction
export const removeReaction = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { postId } = req.params;

  const result = await postService.removeReaction(userId, postId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reaction removed successfully',
    data: result,
  });
});

// Add comment
export const addComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { postId } = req.params;
  const { content } = req.body;

  const result = await postService.addComment(userId, postId, content);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comment added successfully',
    data: result,
  });
});

// Delete comment
export const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { postId, commentId } = req.params;

  const result = await postService.deleteComment(userId, postId, commentId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comment deleted successfully',
    data: result,
  });
});

// Share post
export const sharePost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { postId } = req.params;
  const { content } = req.body;

  const result = await postService.sharePost(userId, postId, content);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Post shared successfully',
    data: result,
  });
});

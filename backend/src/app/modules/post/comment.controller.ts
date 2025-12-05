import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import commentService from './comment.service';

// Get comments for a post
export const getPostComments = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await commentService.getPostComments(postId, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comments retrieved successfully',
    data: result.comments,
    meta: result.pagination,
  });
});

// Get replies for a comment
export const getCommentReplies = catchAsync(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await commentService.getCommentReplies(commentId, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Replies retrieved successfully',
    data: result.replies,
    meta: result.pagination,
  });
});

// Add comment to a post
export const addComment = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const userId = req.user!.userId;
  const { content, parentCommentId } = req.body;

  const result = await commentService.addComment(postId, userId, content, parentCommentId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Comment added successfully',
    data: result,
  });
});

// Update comment
export const updateComment = catchAsync(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const userId = req.user!.userId;
  const { content } = req.body;

  const result = await commentService.updateComment(commentId, userId, content);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comment updated successfully',
    data: result,
  });
});

// Delete comment
export const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const userId = req.user!.userId;

  const result = await commentService.deleteComment(commentId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});

// Toggle like on comment
export const toggleLikeComment = catchAsync(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const userId = req.user!.userId;

  const result = await commentService.toggleLikeComment(commentId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comment like toggled successfully',
    data: result,
  });
});

export default {
  getPostComments,
  getCommentReplies,
  addComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
};

import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import commentService from './comment.service';

class CommentController {
  // Create comment
  createComment = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await commentService.createComment(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Comment created successfully',
      data: result,
    });
  });

  // Get lesson comments
  getLessonComments = catchAsync(async (req: Request, res: Response) => {
    const { lessonId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await commentService.getLessonComments(lessonId, page, limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Comments retrieved successfully',
      data: result.comments,
      meta: result.pagination,
    });
  });

  // Get comment replies
  getCommentReplies = catchAsync(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await commentService.getCommentReplies(commentId, page, limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Replies retrieved successfully',
      data: result.replies,
      meta: result.pagination,
    });
  });

  // Update comment
  updateComment = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { id } = req.params;
    const result = await commentService.updateComment(id, userId, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Comment updated successfully',
      data: result,
    });
  });

  // Delete comment
  deleteComment = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const userRole = req.user?.role as string;
    const { id } = req.params;
    const result = await commentService.deleteComment(id, userId, userRole);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
    });
  });

  // Like comment
  likeComment = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { id } = req.params;
    const result = await commentService.likeComment(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Comment like toggled successfully',
      data: result,
    });
  });

  // Get user comments
  getUserComments = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await commentService.getUserComments(userId, page, limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User comments retrieved successfully',
      data: result.comments,
      meta: result.pagination,
    });
  });
}

export default new CommentController();

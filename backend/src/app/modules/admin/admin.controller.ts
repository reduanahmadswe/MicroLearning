import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import adminService from './admin.service';

class AdminController {
  // Get dashboard stats
  getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
    const result = await adminService.getDashboardStats();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: result,
    });
  });

  // Get all users
  getUsers = catchAsync(async (req: Request, res: Response) => {
    const { role, search, page, limit } = req.query;
    const result = await adminService.getUsers({
      role: role as string,
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Users retrieved successfully',
      data: result.users,
      meta: result.pagination,
    });
  });

  // Ban user
  banUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await adminService.banUser(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
    });
  });

  // Unban user
  unbanUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await adminService.unbanUser(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
    });
  });

  // Promote to instructor
  promoteToInstructor = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await adminService.promoteToInstructor(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
    });
  });

  // Demote to learner
  demoteToLearner = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await adminService.demoteToLearner(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
    });
  });

  // Delete user
  deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await adminService.deleteUser(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
    });
  });

  // Get content stats
  getContentStats = catchAsync(async (_req: Request, res: Response) => {
    const result = await adminService.getContentStats();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Content statistics retrieved successfully',
      data: result,
    });
  });

  // Get system statistics
  getSystemStats = catchAsync(async (_req: Request, res: Response) => {
    const result = await adminService.getSystemStats();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'System statistics retrieved successfully',
      data: result,
    });
  });

  // Get performance metrics
  getPerformanceMetrics = catchAsync(async (_req: Request, res: Response) => {
    const result = await adminService.getPerformanceMetrics();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Performance metrics retrieved successfully',
      data: result,
    });
  });

  // Get error logs
  getErrorLogs = catchAsync(async (req: Request, res: Response) => {
    const { page, limit } = req.query;
    const result = await adminService.getErrorLogs({
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Error logs retrieved successfully',
      data: result,
    });
  });

  // Get database health
  getDatabaseHealth = catchAsync(async (_req: Request, res: Response) => {
    const result = await adminService.getDatabaseHealth();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Database health retrieved successfully',
      data: result,
    });
  });

  // Get comments for moderation
  getComments = catchAsync(async (req: Request, res: Response) => {
    const { status, page, limit } = req.query;
    const result = await adminService.getCommentsForModeration({
      status: status as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Comments retrieved successfully',
      data: result,
    });
  });

  // Moderate comment
  moderateComment = catchAsync(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { action, reason } = req.body;
    const result = await adminService.moderateComment(commentId, action, reason);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Comment ${action}d successfully`,
      data: result,
    });
  });

  // Get flagged content
  getFlaggedContent = catchAsync(async (req: Request, res: Response) => {
    const { page, limit } = req.query;
    const result = await adminService.getFlaggedContent({
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Flagged content retrieved successfully',
      data: result,
    });
  });

  // Remove spam
  removeSpam = catchAsync(async (req: Request, res: Response) => {
    const { contentId } = req.params;
    const { contentType } = req.body;
    await adminService.removeSpamContent(contentId, contentType);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Spam content removed successfully',
      data: null,
    });
  });
}

export default new AdminController();

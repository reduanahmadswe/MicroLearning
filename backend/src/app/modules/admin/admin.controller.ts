import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import adminService from './admin.service';

class AdminController {
  // Get dashboard stats
  getDashboardStats = catchAsync(async (req: Request, res: Response) => {
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

  // Demote to student
  demoteToStudent = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await adminService.demoteToStudent(userId);

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
  getContentStats = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.getContentStats();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Content statistics retrieved successfully',
      data: result,
    });
  });
}

export default new AdminController();

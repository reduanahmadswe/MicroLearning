import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import notificationService from './notification.service';

class NotificationController {
  // Get user notifications
  getUserNotifications = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const isRead =
      req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;

    const result = await notificationService.getUserNotifications(
      userId,
      page,
      limit,
      isRead
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Notifications retrieved successfully',
      data: result.notifications,
      meta: result.pagination,
    });
  });

  // Mark as read
  markAsRead = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { id } = req.params;
    const result = await notificationService.markAsRead(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Notification marked as read',
      data: result,
    });
  });

  // Mark all as read
  markAllAsRead = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await notificationService.markAllAsRead(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
    });
  });

  // Delete notification
  deleteNotification = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { id } = req.params;
    const result = await notificationService.deleteNotification(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
    });
  });

  // Get unread count
  getUnreadCount = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await notificationService.getUnreadCount(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Unread count retrieved successfully',
      data: result,
    });
  });
}

export default new NotificationController();

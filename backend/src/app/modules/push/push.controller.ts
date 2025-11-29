import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import { PushService } from './push.service';

// Register device token
const registerDevice = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await PushService.registerDevice(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Device registered successfully',
    data: result,
  });
});

// Unregister device token
const unregisterDevice = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { token } = req.body;

  const result = await PushService.unregisterDevice(userId, token);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
  });
});

// Send push notification (admin only)
const sendNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await PushService.sendNotification(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Notification sent successfully',
    data: result,
  });
});

// Send bulk notification (admin only)
const sendBulkNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await PushService.sendBulkNotification(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Bulk notifications sent successfully',
    data: result,
  });
});

// Schedule notification (admin only)
const scheduleNotification = catchAsync(async (req: Request, res: Response) => {
  const { userId, title, body, scheduledAt, data } = req.body;

  const result = await PushService.scheduleNotification(
    userId,
    title,
    body,
    new Date(scheduledAt),
    data
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Notification scheduled successfully',
    data: result,
  });
});

// Get user's devices
const getUserDevices = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await PushService.getUserDevices(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Devices retrieved successfully',
    data: result,
  });
});

// Get push notification statistics
const getPushStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await PushService.getPushStats(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Push statistics retrieved successfully',
    data: result,
  });
});

export const PushController = {
  registerDevice,
  unregisterDevice,
  sendNotification,
  sendBulkNotification,
  scheduleNotification,
  getUserDevices,
  getPushStats,
};

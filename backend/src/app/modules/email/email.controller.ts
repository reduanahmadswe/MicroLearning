import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import emailService from './email.service';

// ==================== Email Sending Controllers ====================

export const sendEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await emailService.sendEmail(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email processed successfully',
    data: result,
  });
});

export const sendBulkEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await emailService.sendBulkEmail(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bulk emails processed successfully',
    data: result,
  });
});

// ==================== Email Template Controllers ====================

export const createEmailTemplate = catchAsync(async (req: Request, res: Response) => {
  const template = await emailService.createEmailTemplate(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Email template created successfully',
    data: template,
  });
});

export const getEmailTemplate = catchAsync(async (req: Request, res: Response) => {
  const { templateId } = req.params;
  const template = await emailService.getEmailTemplate(templateId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email template retrieved successfully',
    data: template,
  });
});

export const getAllEmailTemplates = catchAsync(async (_req: Request, res: Response) => {
  const templates = await emailService.getAllEmailTemplates();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email templates retrieved successfully',
    data: templates,
  });
});

export const updateEmailTemplate = catchAsync(async (req: Request, res: Response) => {
  const { templateId } = req.params;
  const template = await emailService.updateEmailTemplate(templateId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email template updated successfully',
    data: template,
  });
});

export const deleteEmailTemplate = catchAsync(async (req: Request, res: Response) => {
  const { templateId } = req.params;
  await emailService.deleteEmailTemplate(templateId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email template deleted successfully',
    data: null,
  });
});

// ==================== Email Preference Controllers ====================

export const getMyEmailPreferences = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const preferences = await emailService.getOrCreateEmailPreferences(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email preferences retrieved successfully',
    data: preferences,
  });
});

export const updateMyEmailPreferences = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const preferences = await emailService.updateEmailPreferences(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email preferences updated successfully',
    data: preferences,
  });
});

export const unsubscribeFromAll = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const preferences = await emailService.unsubscribeFromAll(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Unsubscribed from all emails successfully',
    data: preferences,
  });
});

// ==================== Email Log Controllers ====================

export const getEmailLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await emailService.getEmailLogs(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email logs retrieved successfully',
    data: result.logs,
    meta: {
      total: result.pagination.total,
      page: Math.floor(result.pagination.skip / result.pagination.limit) + 1,
      limit: result.pagination.limit,
    },
  });
});

export const getEmailStats = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.query;
  const stats = await emailService.getEmailStats(userId as string | undefined);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email stats retrieved successfully',
    data: stats,
  });
});

export const trackEmailEvent = catchAsync(async (req: Request, res: Response) => {
  const { messageId, event, timestamp } = req.body;
  const emailLog = await emailService.trackEmailEvent(
    messageId,
    event,
    timestamp ? new Date(timestamp) : undefined
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email event tracked successfully',
    data: emailLog,
  });
});

// ==================== Testing Controller ====================

export const sendTestEmail = catchAsync(async (req: Request, res: Response) => {
  const { recipient } = req.body;
  
  const result = await emailService.sendEmail({
    recipient: recipient || 'test@example.com',
    templateType: 'welcome',
    variables: {
      username: 'Test User',
      dashboardUrl: 'https://microlearning-beta.vercel.app/dashboard',
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Test email sent successfully',
    data: result,
  });
});

// ==================== Admin Controllers ====================

export const initializeTemplates = catchAsync(async (_req: Request, res: Response) => {
  await emailService.initializeDefaultTemplates();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Default email templates initialized successfully',
    data: null,
  });
});

export default {
  sendEmail,
  sendBulkEmail,
  createEmailTemplate,
  getEmailTemplate,
  getAllEmailTemplates,
  updateEmailTemplate,
  deleteEmailTemplate,
  getMyEmailPreferences,
  updateMyEmailPreferences,
  unsubscribeFromAll,
  getEmailLogs,
  getEmailStats,
  trackEmailEvent,
  initializeTemplates,
  sendTestEmail,
};

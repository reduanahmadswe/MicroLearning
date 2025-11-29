import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import * as CareerMentorService from './careerMentor.service';
import { Types } from 'mongoose';

/**
 * Get Career Advice
 */
export const getCareerAdvice = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const result = await CareerMentorService.getCareerAdvice(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Career advice provided successfully',
    data: result,
  });
});

/**
 * Assess Skills
 */
export const assessSkills = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const result = await CareerMentorService.assessSkills(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Skills assessed successfully',
    data: result,
  });
});

/**
 * Prepare Interview
 */
export const prepareInterview = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const result = await CareerMentorService.prepareInterview(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Interview preparation materials generated successfully',
    data: result,
  });
});

/**
 * Review Resume
 */
export const reviewResume = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const result = await CareerMentorService.reviewResume(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Resume reviewed successfully',
    data: result,
  });
});

/**
 * Get Salary Negotiation Advice
 */
export const getSalaryNegotiationAdvice = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const result = await CareerMentorService.getSalaryNegotiationAdvice(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Salary negotiation advice provided successfully',
    data: result,
  });
});

/**
 * Get Sessions
 */
export const getSessions = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const { page, limit, sessionType, isActive } = req.query;

  const result = await CareerMentorService.getSessions(
    userId,
    page ? parseInt(page as string) : 1,
    limit ? parseInt(limit as string) : 20,
    sessionType as any,
    isActive ? isActive === 'true' : undefined
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Career mentor sessions retrieved successfully',
    data: result.sessions,
    meta: {
      page: result.pagination.currentPage,
      limit: result.pagination.itemsPerPage,
      total: result.pagination.totalItems,
    },
  });
});

/**
 * Get Session by ID
 */
export const getSessionById = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const { sessionId } = req.params;

  const result = await CareerMentorService.getSessionById(userId, sessionId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Career mentor session retrieved successfully',
    data: result,
  });
});

/**
 * Delete Session
 */
export const deleteSession = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const { sessionId } = req.params;

  const result = await CareerMentorService.deleteSession(userId, sessionId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
  });
});

/**
 * Get Career Mentor Statistics
 */
export const getCareerMentorStats = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const result = await CareerMentorService.getCareerMentorStats(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Career mentor statistics retrieved successfully',
    data: result,
  });
});

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import * as RoadmapService from './roadmap.service';
import { Types } from 'mongoose';

/**
 * Generate Roadmap
 */
export const generateRoadmap = catchAsync(async (req: Request, res: Response) => {

  const userId = new Types.ObjectId(req.user?.userId);
  const result = await RoadmapService.generateRoadmap(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Roadmap generated successfully',
    data: result,
  });
});

/**
 * Get User Roadmaps
 */
export const getUserRoadmaps = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const { page, limit, status } = req.query;

  const result = await RoadmapService.getUserRoadmaps(
    userId,
    page ? parseInt(page as string) : 1,
    limit ? parseInt(limit as string) : 20,
    status as any
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Roadmaps retrieved successfully',
    data: result.roadmaps,
    meta: {
      page: result.pagination.currentPage,
      limit: result.pagination.itemsPerPage,
      total: result.pagination.totalItems,
    },
  });
});

/**
 * Get Roadmap by ID
 */
export const getRoadmapById = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const { roadmapId } = req.params;

  const result = await RoadmapService.getRoadmapById(userId, roadmapId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Roadmap retrieved successfully',
    data: result,
  });
});

/**
 * Update Roadmap Progress
 */
export const updateRoadmapProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const { roadmapId } = req.params;

  const result = await RoadmapService.updateRoadmapProgress(userId, roadmapId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Roadmap progress updated successfully',
    data: result,
  });
});

/**
 * Delete Roadmap
 */
export const deleteRoadmap = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const { roadmapId } = req.params;

  const result = await RoadmapService.deleteRoadmap(userId, roadmapId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
  });
});

/**
 * Get Roadmap Statistics
 */
export const getRoadmapStats = catchAsync(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user?.userId);
  const result = await RoadmapService.getRoadmapStats(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Roadmap statistics retrieved successfully',
    data: result,
  });
});

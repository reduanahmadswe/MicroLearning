import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import { UploadService } from './upload.service';

// Get upload URL
const getUploadUrl = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await UploadService.generateUploadUrl(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Upload URL generated successfully',
    data: result,
  });
});

// Get user's files
const getUserFiles = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { fileType, page, limit } = req.query;

  const result = await UploadService.getUserFiles(userId, {
    fileType: fileType as string,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Files retrieved successfully',
    data: result,
  });
});

// Get file by ID
const getFileById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { fileId } = req.params;

  const result = await UploadService.getFileById(userId, fileId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'File retrieved successfully',
    data: result,
  });
});

// Delete file
const deleteFile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { fileId } = req.params;

  const result = await UploadService.deleteFile(userId, fileId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
  });
});

// Make file public
const makeFilePublic = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { fileId } = req.params;

  const result = await UploadService.makeFilePublic(userId, fileId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'File is now public',
    data: result,
  });
});

// Get upload statistics
const getUploadStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await UploadService.getUploadStats(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Upload statistics retrieved successfully',
    data: result,
  });
});

export const UploadController = {
  getUploadUrl,
  getUserFiles,
  getFileById,
  deleteFile,
  makeFilePublic,
  getUploadStats,
};

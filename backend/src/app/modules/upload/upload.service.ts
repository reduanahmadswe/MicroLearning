import { IUploadRequest, IUploadResponse } from './upload.types';
import { FileMetadata } from './upload.model';
import ApiError from '../../../utils/ApiError';
import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { validateFileType, validateFileSize } from './upload.validation';

/**
 * File Upload Service
 * 
 * This service provides file upload functionality with support for:
 * - Images, Videos, Audio, and Documents
 * - Pre-signed URL generation (ready for AWS S3/MinIO integration)
 * - File metadata tracking
 * - File size and type validation
 * 
 * IMPLEMENTATION NOTES:
 * 1. Currently configured for local file storage simulation
 * 2. For production, integrate AWS S3 with pre-signed URLs:
 *    - Install: npm install aws-sdk
 *    - Configure AWS credentials in .env
 *    - Replace generatePresignedUrl with actual S3 implementation
 * 3. Alternative cloud storage options:
 *    - Cloudinary (images/videos)
 *    - DigitalOcean Spaces (S3-compatible)
 *    - MinIO (self-hosted S3-compatible)
 */

// Generate pre-signed upload URL
// NOTE: This is a placeholder. Replace with actual S3/cloud storage implementation
const generateUploadUrl = async (userId: string, data: IUploadRequest): Promise<IUploadResponse> => {
  const { fileType, fileName, fileSize, mimeType } = data;

  // Validate file type
  if (!validateFileType(fileType, mimeType)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid MIME type for ${fileType}`);
  }

  // Validate file size
  if (!validateFileSize(fileType, fileSize)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `File size exceeds maximum allowed size for ${fileType}`
    );
  }

  // Generate unique file key
  const fileExtension = path.extname(fileName);
  const fileKey = `${fileType}s/${userId}/${uuidv4()}${fileExtension}`;

  // TODO: Replace with actual S3 pre-signed URL generation
  // Example with AWS S3:
  // const s3 = new AWS.S3();
  // const uploadUrl = await s3.getSignedUrlPromise('putObject', {
  //   Bucket: process.env.S3_BUCKET,
  //   Key: fileKey,
  //   Expires: 3600, // 1 hour
  //   ContentType: mimeType,
  // });

  // Simulated upload URL (for development)
  const uploadUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${fileKey}`;
  const fileUrl = uploadUrl; // In production, this would be the permanent S3 URL

  // Save file metadata
  const fileMetadata = await FileMetadata.create({
    user: userId,
    fileName,
    fileSize,
    mimeType,
    fileType,
    fileUrl,
    fileKey,
    isPublic: false,
  });

  return {
    uploadUrl,
    fileUrl,
    fileId: fileMetadata._id.toString(),
    expiresIn: 3600, // 1 hour
  };
};

// Get user's uploaded files
const getUserFiles = async (
  userId: string,
  filters: { fileType?: string; page?: number; limit?: number }
) => {
  const { fileType, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const query: any = { user: userId };
  if (fileType) {
    query.fileType = fileType;
  }

  const files = await FileMetadata.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await FileMetadata.countDocuments(query);

  return {
    files,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get file by ID
const getFileById = async (userId: string, fileId: string) => {
  const file = await FileMetadata.findById(fileId);

  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }

  // Check if user has access to this file
  if (file.user.toString() !== userId && !file.isPublic) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  return file;
};

// Delete file
const deleteFile = async (userId: string, fileId: string) => {
  const file = await FileMetadata.findById(fileId);

  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }

  // Only file owner can delete
  if (file.user.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete this file');
  }

  // TODO: Delete file from S3/cloud storage
  // Example with AWS S3:
  // const s3 = new AWS.S3();
  // await s3.deleteObject({
  //   Bucket: process.env.S3_BUCKET,
  //   Key: file.fileKey,
  // }).promise();

  // Delete metadata
  await FileMetadata.deleteOne({ _id: fileId });

  return { message: 'File deleted successfully' };
};

// Make file public
const makeFilePublic = async (userId: string, fileId: string) => {
  const file = await FileMetadata.findById(fileId);

  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }

  if (file.user.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to modify this file');
  }

  file.isPublic = true;
  await file.save();

  return file;
};

// Get upload statistics
const getUploadStats = async (userId: string) => {
  const stats = await FileMetadata.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$fileType',
        count: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
      },
    },
  ]);

  const totalFiles = await FileMetadata.countDocuments({ user: userId });
  const totalSize = stats.reduce((sum, stat) => sum + stat.totalSize, 0);

  return {
    totalFiles,
    totalSize,
    byType: stats.reduce((acc: any, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalSize: stat.totalSize,
      };
      return acc;
    }, {}),
  };
};

export const UploadService = {
  generateUploadUrl,
  getUserFiles,
  getFileById,
  deleteFile,
  makeFilePublic,
  getUploadStats,
};

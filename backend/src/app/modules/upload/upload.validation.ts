import { z } from 'zod';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZES } from './upload.types';

export const getUploadUrlSchema = z.object({
  body: z.object({
    fileType: z.enum(['image', 'video', 'audio', 'document'], {
      errorMap: () => ({ message: 'File type must be image, video, audio, or document' }),
    }),
    fileName: z.string().min(1, 'File name is required'),
    fileSize: z.number().positive('File size must be positive'),
    mimeType: z.string().min(1, 'MIME type is required'),
  }),
});

export const deleteFileSchema = z.object({
  params: z.object({
    fileId: z.string().min(1, 'File ID is required'),
  }),
});

// Validation helper
export const validateFileType = (fileType: 'image' | 'video' | 'audio' | 'document', mimeType: string): boolean => {
  return ALLOWED_FILE_TYPES[fileType].includes(mimeType);
};

export const validateFileSize = (fileType: 'image' | 'video' | 'audio' | 'document', fileSize: number): boolean => {
  return fileSize <= MAX_FILE_SIZES[fileType];
};

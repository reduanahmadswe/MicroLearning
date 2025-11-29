import { z } from 'zod';

export const createVideoSchema = z.object({
  body: z.object({
    lessonId: z.string().min(1, 'Lesson ID is required'),
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().max(2000, 'Description too long').optional(),
    videoUrl: z.string().url('Invalid video URL'),
    thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
    duration: z.number().min(1, 'Duration must be positive'),
    fileSize: z.number().min(1, 'File size must be positive'),
    resolution: z.string().optional(),
    format: z.string().min(1, 'Format is required'),
    isPublic: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateVideoSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    thumbnailUrl: z.string().url().optional(),
    isPublic: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const addSubtitleSchema = z.object({
  body: z.object({
    language: z.string().min(1, 'Language is required'),
    languageCode: z.string().min(2).max(5, 'Invalid language code'),
    url: z.string().url('Invalid subtitle URL'),
    isDefault: z.boolean().optional(),
  }),
});

export const updateProgressSchema = z.object({
  body: z.object({
    watchedDuration: z.number().min(0),
    lastPosition: z.number().min(0),
    completed: z.boolean().optional(),
    playbackSpeed: z.number().min(0.25).max(2.0).optional(),
  }),
});

export const addQualitySchema = z.object({
  body: z.object({
    quality: z.string().min(1, 'Quality is required'),
    url: z.string().url('Invalid video URL'),
    fileSize: z.number().min(1, 'File size must be positive'),
    bitrate: z.number().optional(),
  }),
});

export const searchVideosSchema = z.object({
  query: z.object({
    query: z.string().optional(),
    lessonId: z.string().optional(),
    uploaderId: z.string().optional(),
    tags: z.string().optional(),
    minDuration: z.string().optional(),
    maxDuration: z.string().optional(),
    status: z.enum(['processing', 'ready', 'failed']).optional(),
    isPublic: z.string().optional(),
    sortBy: z.enum(['recent', 'popular', 'duration']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['processing', 'ready', 'failed']),
  }),
});

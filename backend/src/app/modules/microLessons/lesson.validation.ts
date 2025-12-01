import { z } from 'zod';

const mediaSchema = z.object({
  type: z.enum(['image', 'video', 'audio', 'document']),
  url: z.string().url('Invalid media URL'),
  title: z.string().optional(),
  duration: z.number().positive().optional(),
});

export const createLessonValidation = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Title is required',
      })
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title cannot exceed 200 characters'),
    description: z
      .string({
        required_error: 'Description is required',
      })
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description cannot exceed 1000 characters'),
    content: z
      .string({
        required_error: 'Content is required',
      })
      .min(50, 'Content must be at least 50 characters'),
    topic: z.string({
      required_error: 'Topic is required',
    }),
    tags: z.array(z.string()).optional().default([]),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
      required_error: 'Difficulty is required',
    }),
    estimatedTime: z
      .number({
        required_error: 'Estimated time is required',
      })
      .min(1, 'Estimated time must be at least 1 minute')
      .max(60, 'Estimated time cannot exceed 60 minutes'),
    course: z
      .string({
        required_error: 'Course ID is required - lessons must be created under a course',
      })
      .min(1, 'Course ID is required'),
    order: z
      .number()
      .min(1, 'Order must be at least 1')
      .optional(),
    media: z.array(mediaSchema).optional().default([]),
    thumbnailUrl: z.string().url().optional(),
    keyPoints: z.array(z.string()).optional().default([]),
    isPremium: z.boolean().optional().default(false),
  }),
});

export const generateLessonValidation = z.object({
  body: z.object({
    topic: z
      .string({
        required_error: 'Topic is required',
      })
      .min(3, 'Topic must be at least 3 characters'),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
      required_error: 'Difficulty is required',
    }),
    estimatedTime: z.number().min(1).max(10).optional().default(2),
    preferences: z
      .object({
        includeExamples: z.boolean().optional().default(true),
        includeQuiz: z.boolean().optional().default(false),
        learningStyle: z.enum(['visual', 'auditory', 'kinesthetic']).optional(),
      })
      .optional(),
  }),
});

export const updateLessonValidation = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(1000).optional(),
    content: z.string().min(50).optional(),
    topic: z.string().optional(),
    tags: z.array(z.string()).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    estimatedTime: z.number().min(1).max(60).optional(),
    media: z.array(mediaSchema).optional(),
    thumbnailUrl: z.string().url().optional(),
    keyPoints: z.array(z.string()).optional(),
    isPremium: z.boolean().optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const getLessonsValidation = z.object({
  query: z.object({
    course: z.string().optional(),
    topic: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    duration: z.string().optional(), // "1-5" or "5-10"
    tags: z.string().optional(), // comma-separated
    isPremium: z.enum(['true', 'false']).optional(),
    author: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateLessonInput = z.infer<typeof createLessonValidation>['body'];
export type GenerateLessonInput = z.infer<typeof generateLessonValidation>['body'];
export type UpdateLessonInput = z.infer<typeof updateLessonValidation>['body'];
export type GetLessonsQuery = z.infer<typeof getLessonsValidation>['query'];

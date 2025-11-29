import { z } from 'zod';

const courseLessonSchema = z.object({
  lesson: z.string({
    required_error: 'Lesson ID is required',
  }),
  order: z
    .number({
      required_error: 'Lesson order is required',
    })
    .min(1, 'Order must be at least 1'),
  isOptional: z.boolean().optional().default(false),
});

export const createCourseValidation = z.object({
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
      .max(2000, 'Description cannot exceed 2000 characters'),
    topic: z.string({
      required_error: 'Topic is required',
    }),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
      required_error: 'Difficulty is required',
    }),
    thumbnailUrl: z.string().url().optional(),
    lessons: z
      .array(courseLessonSchema)
      .min(1, 'Course must have at least one lesson'),
    isPremium: z.boolean().optional().default(false),
    price: z.number().min(0).optional(),
  }),
});

export const updateCourseValidation = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(2000).optional(),
    topic: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    thumbnailUrl: z.string().url().optional(),
    lessons: z.array(courseLessonSchema).min(1).optional(),
    isPremium: z.boolean().optional(),
    price: z.number().min(0).optional(),
    isPublished: z.boolean().optional(),
  }),
});

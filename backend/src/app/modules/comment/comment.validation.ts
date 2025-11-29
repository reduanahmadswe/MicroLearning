import { z } from 'zod';

export const createCommentValidation = z.object({
  body: z.object({
    lesson: z.string({
      required_error: 'Lesson ID is required',
    }),
    content: z
      .string({
        required_error: 'Comment content is required',
      })
      .min(1, 'Comment must be at least 1 character')
      .max(2000, 'Comment cannot exceed 2000 characters'),
    parentComment: z.string().optional(),
  }),
});

export const updateCommentValidation = z.object({
  body: z.object({
    content: z
      .string({
        required_error: 'Comment content is required',
      })
      .min(1, 'Comment must be at least 1 character')
      .max(2000, 'Comment cannot exceed 2000 characters'),
  }),
});

import { z } from 'zod';

export const addCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
    parentCommentId: z.string().optional(),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
  }),
});

console.log('Comment validation schemas loaded successfully');

import { z } from 'zod';

export const addBookmarkValidation = z.object({
  body: z.object({
    lessonId: z.string(),
    collection: z.string().max(50).optional().default('Default'),
    notes: z.string().max(1000).optional(),
  }),
});

export const updateBookmarkValidation = z.object({
  body: z.object({
    collection: z.string().max(50).optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export type AddBookmarkInput = z.infer<typeof addBookmarkValidation>['body'];
export type UpdateBookmarkInput = z.infer<typeof updateBookmarkValidation>['body'];

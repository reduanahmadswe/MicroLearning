import { z } from 'zod';

export const createFlashcardValidation = z.object({
  body: z.object({
    front: z.string().min(3).max(1000),
    back: z.string().min(3).max(2000),
    hint: z.string().max(500).optional(),
    lesson: z.string().optional(),
    topic: z.string().min(2),
    isPublic: z.boolean().optional().default(false),
    frontImage: z.string().url().optional(),
    backImage: z.string().url().optional(),
  }),
});

export const reviewFlashcardValidation = z.object({
  body: z.object({
    flashcardId: z.string(),
    quality: z.number().min(0).max(5).int(),
  }),
});

export const generateFlashcardsValidation = z.object({
  body: z.object({
    lessonId: z.string(),
    count: z.number().min(1).max(20).optional().default(10),
  }),
});

export type CreateFlashcardInput = z.infer<typeof createFlashcardValidation>['body'];
export type ReviewFlashcardInput = z.infer<typeof reviewFlashcardValidation>['body'];
export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsValidation>['body'];

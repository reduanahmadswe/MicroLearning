import { z } from 'zod';

export const updateProgressValidation = z.object({
  body: z.object({
    lessonId: z.string({
      required_error: 'Lesson ID is required',
    }),
    progress: z
      .number({
        required_error: 'Progress is required',
      })
      .min(0)
      .max(100),
    timeSpent: z
      .number({
        required_error: 'Time spent is required',
      })
      .min(0),
    status: z.enum(['not-started', 'in-progress', 'completed']).optional(),
    score: z.number().min(0).max(100).optional(),
    mastery: z.number().min(0).max(100).optional(),
  }),
});

export type UpdateProgressInput = z.infer<typeof updateProgressValidation>['body'];

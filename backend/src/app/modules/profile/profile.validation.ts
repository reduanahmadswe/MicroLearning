import { z } from 'zod';

export const updateProfileValidation = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .optional(),
    bio: z
      .string()
      .max(500, 'Bio cannot exceed 500 characters')
      .optional(),
    profilePicture: z
      .string()
      .url('Invalid profile picture URL')
      .optional(),
    phone: z
      .string()
      .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format')
      .optional(),
  }),
});

export const updatePreferencesValidation = z.object({
  body: z.object({
    interests: z.array(z.string()).optional(),
    goals: z.array(z.string()).optional(),
    dailyLearningTime: z
      .number()
      .min(5, 'Daily learning time must be at least 5 minutes')
      .max(480, 'Daily learning time cannot exceed 8 hours')
      .optional(),
    preferredDifficulty: z
      .enum(['beginner', 'intermediate', 'advanced'])
      .optional(),
    language: z.string().optional(),
    learningStyle: z.enum(['visual', 'auditory', 'kinesthetic']).optional(),
  }),
});

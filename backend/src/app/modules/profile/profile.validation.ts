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
      .optional()
      .or(z.literal('')),
    profilePicture: z
      .string()
      .url('Invalid profile picture URL')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format')
      .optional()
      .or(z.literal('')),
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

export const changePasswordValidation = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters')
      .max(100, 'New password cannot exceed 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your new password'),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

export const updateEmailValidation = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email address'),
    password: z
      .string()
      .min(1, 'Password is required to change email'),
  }),
});

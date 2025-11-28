import { z } from 'zod';

export const registerValidation = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, 'Password must be at least 6 characters'),
    name: z
      .string({
        required_error: 'Name is required',
      })
      .min(2, 'Name must be at least 2 characters'),
    role: z.enum(['admin', 'learner']).optional().default('learner'),
  }),
});

export const loginValidation = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(1, 'Password is required'),
  }),
});

export const refreshTokenValidation = z.object({
  body: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required',
    }),
  }),
});

export type RegisterInput = z.infer<typeof registerValidation>['body'];
export type LoginInput = z.infer<typeof loginValidation>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenValidation>['body'];

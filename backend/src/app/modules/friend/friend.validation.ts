import { z } from 'zod';

export const sendFriendRequestSchema = z.object({
  body: z.object({
    friendId: z.string().min(1, 'Friend ID is required'),
  }),
});

export const respondToRequestSchema = z.object({
  body: z.object({
    requestId: z.string().min(1, 'Request ID is required'),
    action: z.enum(['accept', 'reject'], {
      errorMap: () => ({ message: 'Action must be either accept or reject' }),
    }),
  }),
});

export const removeFriendSchema = z.object({
  params: z.object({
    friendId: z.string().min(1, 'Friend ID is required'),
  }),
});

export const blockUserSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
});

import { z } from 'zod';

export const registerDeviceSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Device token is required'),
    platform: z.enum(['ios', 'android', 'web'], {
      errorMap: () => ({ message: 'Platform must be ios, android, or web' }),
    }),
  }),
});

export const sendNotificationSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
    body: z.string().min(1, 'Body is required').max(500, 'Body must be at most 500 characters'),
    data: z.record(z.any()).optional(),
  }),
});

export const sendBulkNotificationSchema = z.object({
  body: z.object({
    userIds: z.array(z.string()).min(1, 'At least one user ID is required'),
    title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
    body: z.string().min(1, 'Body is required').max(500, 'Body must be at most 500 characters'),
    data: z.record(z.any()).optional(),
  }),
});

export const scheduleNotificationSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
    body: z.string().min(1, 'Body is required').max(500, 'Body must be at most 500 characters'),
    scheduledAt: z.string().refine((date) => !isNaN(Date.parse(date)) && new Date(date) > new Date(), {
      message: 'Scheduled time must be in the future',
    }),
    data: z.record(z.any()).optional(),
  }),
});

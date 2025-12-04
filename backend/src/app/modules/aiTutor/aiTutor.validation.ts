import { z } from 'zod';

export const chatRequestSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message is required').max(4000, 'Message too long'),
    sessionId: z.string().optional(),
    topic: z.string().optional(),
    lessonId: z.string().optional(),
    courseId: z.string().optional(),
    conversationHistory: z.array(z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })).optional(),
  }),
});

export const getSessionsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const getSessionSchema = z.object({
  params: z.object({
    sessionId: z.string(),
  }),
});

export const deleteSessionSchema = z.object({
  params: z.object({
    sessionId: z.string(),
  }),
});

export const updateSessionTitleSchema = z.object({
  params: z.object({
    sessionId: z.string(),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  }),
});

export const clearSessionSchema = z.object({
  params: z.object({
    sessionId: z.string(),
  }),
});

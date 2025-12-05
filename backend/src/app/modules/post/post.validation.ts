import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    content: z.string().max(5000, 'Content too long').optional(),
    images: z.array(z.string()).optional(),
    video: z.string().optional(),
    type: z.enum(['text', 'achievement', 'learning', 'question', 'milestone']).optional(),
    metadata: z
      .object({
        courseId: z.string().optional(),
        lessonId: z.string().optional(),
        badgeId: z.string().optional(),
        certificateId: z.string().optional(),
        achievement: z.string().optional(),
        xpGained: z.number().optional(),
        levelUp: z.number().optional(),
      })
      .optional(),
    visibility: z.enum(['public', 'friends', 'private']).optional(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    content: z.string().max(5000).optional(),
    images: z.array(z.string()).optional(),
    video: z.string().optional(),
    visibility: z.enum(['public', 'friends', 'private']).optional(),
  }),
});

export const addReactionSchema = z.object({
  body: z.object({
    type: z.enum(['like', 'love', 'celebrate', 'insightful', 'curious']),
  }),
});

export const addCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
  }),
});

export const sharePostSchema = z.object({
  body: z.object({
    content: z.string().max(5000).optional(),
  }),
});

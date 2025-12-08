import { z } from 'zod';

export const createBadgeValidation = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(500),
    icon: z.string().url(),
    criteria: z.object({
      type: z.enum(['streak', 'lessons_completed', 'quiz_perfect', 'xp_milestone', 'flashcard_mastered', 'topic_mastered']),
      threshold: z.number().min(1),
      topic: z.string().optional(),
    }),
    rarity: z.enum(['common', 'rare', 'epic', 'legendary']).default('common'),
    xpReward: z.number().min(0).default(0),
  }),
});

export const awardBadgeValidation = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    badgeId: z.string().min(1, 'Badge ID is required'),
    reason: z.string().optional(),
  }),
});

export type CreateBadgeInput = z.infer<typeof createBadgeValidation>['body'];
export type AwardBadgeInput = z.infer<typeof awardBadgeValidation>['body'];

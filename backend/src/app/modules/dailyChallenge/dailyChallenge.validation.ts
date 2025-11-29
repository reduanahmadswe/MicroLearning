import { z } from 'zod';

// Daily Challenge Schemas
export const createDailyChallengeSchema = z.object({
  body: z.object({
    challengeType: z.enum([
      'lesson_completion',
      'quiz_score',
      'study_time',
      'streak_maintain',
      'flashcard_review',
      'forum_participation',
      'video_watch',
      'custom',
    ]),
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(1000),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    target: z.number().min(1),
    requirement: z
      .object({
        lessonCount: z.number().min(0).optional(),
        quizScore: z.number().min(0).max(100).optional(),
        studyTimeMinutes: z.number().min(0).optional(),
        streakDays: z.number().min(0).optional(),
        flashcardCount: z.number().min(0).optional(),
        forumPosts: z.number().min(0).optional(),
        videoWatchTime: z.number().min(0).optional(),
        customCondition: z.string().optional(),
      })
      .optional()
      .default({}),
    rewards: z.object({
      xp: z.number().min(0),
      coins: z.number().min(0).optional(),
      badgeId: z.string().optional(),
      itemId: z.string().optional(),
    }),
    availableDate: z.string().datetime().optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

export const updateChallengeProgressSchema = z.object({
  body: z.object({
    challengeId: z.string(),
    progressIncrement: z.number().min(0),
    metadata: z.record(z.any()).optional(),
  }),
});

export const claimRewardsSchema = z.object({
  params: z.object({
    challengeId: z.string(),
  }),
});

export const getActiveChallengesSchema = z.object({
  query: z.object({
    difficulty: z.enum(['easy', 'medium', 'hard', 'extreme']).optional(),
    challengeType: z.string().optional(),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('20'),
    skip: z.string().transform(Number).pipe(z.number().min(0)).optional().default('0'),
  }),
});

export const getChallengeHistorySchema = z.object({
  query: z.object({
    status: z.enum(['completed', 'in-progress', 'failed']).optional(),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('20'),
    skip: z.string().transform(Number).pipe(z.number().min(0)).optional().default('0'),
  }),
});

// Weekly Challenge Schemas
export const createWeeklyChallengeSchema = z.object({
  body: z.object({
    challengeType: z.enum([
      'total_lessons',
      'total_quizzes',
      'total_study_time',
      'course_completion',
      'forum_engagement',
      'video_completion',
      'custom',
    ]),
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(1000),
    difficulty: z.enum(['medium', 'hard', 'extreme']),
    target: z.number().min(1),
    requirement: z
      .object({
        lessonCount: z.number().min(0).optional(),
        quizCount: z.number().min(0).optional(),
        studyTimeMinutes: z.number().min(0).optional(),
        courseCount: z.number().min(0).optional(),
        forumEngagement: z.number().min(0).optional(),
        videoCount: z.number().min(0).optional(),
        customCondition: z.string().optional(),
      })
      .optional()
      .default({}),
    rewards: z.object({
      xp: z.number().min(0),
      coins: z.number().min(0).optional(),
      badgeId: z.string().optional(),
      itemId: z.string().optional(),
      exclusiveContent: z.boolean().optional(),
    }),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export const getStreakInfoSchema = z.object({
  params: z.object({
    userId: z.string().optional(),
  }),
});

export type CreateDailyChallengeInput = z.infer<typeof createDailyChallengeSchema>['body'];
export type CreateWeeklyChallengeInput = z.infer<typeof createWeeklyChallengeSchema>['body'];
export type UpdateChallengeProgressInput = z.infer<typeof updateChallengeProgressSchema>['body'];
export type GetActiveChallengesQuery = z.infer<typeof getActiveChallengesSchema>['query'];
export type GetChallengeHistoryQuery = z.infer<typeof getChallengeHistorySchema>['query'];

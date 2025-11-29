import { z } from 'zod';

// Progress Share Schemas
export const createProgressShareSchema = z.object({
  body: z.object({
    shareType: z.enum(['achievement', 'streak', 'course_complete', 'challenge_win', 'level_up', 'custom']),
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(1000),
    metadata: z.object({
      achievementId: z.string().optional(),
      courseId: z.string().optional(),
      challengeId: z.string().optional(),
      streakDays: z.number().min(0).optional(),
      level: z.number().min(1).optional(),
      xpGained: z.number().min(0).optional(),
      customImage: z.string().url().optional(),
    }).optional().default({}),
    visibility: z.enum(['public', 'friends', 'private']).default('friends'),
  }),
});

export const updateProgressShareSchema = z.object({
  params: z.object({
    shareId: z.string(),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(1000).optional(),
    visibility: z.enum(['public', 'friends', 'private']).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const addReactionSchema = z.object({
  params: z.object({
    shareId: z.string(),
  }),
  body: z.object({
    reactionType: z.enum(['like', 'love', 'celebrate', 'clap', 'fire']),
  }),
});

export const addCommentSchema = z.object({
  params: z.object({
    shareId: z.string(),
  }),
  body: z.object({
    content: z.string().min(1).max(500),
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({
    shareId: z.string(),
    commentId: z.string(),
  }),
});

export const getProgressFeedSchema = z.object({
  query: z.object({
    visibility: z.enum(['public', 'friends', 'private']).optional(),
    shareType: z.enum(['achievement', 'streak', 'course_complete', 'challenge_win', 'level_up', 'custom']).optional(),
    userId: z.string().optional(),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('20'),
    skip: z.string().transform(Number).pipe(z.number().min(0)).optional().default('0'),
  }),
});

// Progress Stats Schemas
export const updateProgressStatsSchema = z.object({
  body: z.object({
    xpGained: z.number().min(0).optional(),
    lessonCompleted: z.boolean().optional(),
    courseCompleted: z.boolean().optional(),
    studyTimeMinutes: z.number().min(0).optional(),
    challengeWon: z.boolean().optional(),
  }),
});

export const compareProgressSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
});

// Leaderboard Schemas
export const getLeaderboardSchema = z.object({
  query: z.object({
    timeframe: z.enum(['daily', 'weekly', 'monthly', 'all-time']).default('weekly'),
    category: z.enum(['xp', 'streak', 'lessons', 'challenges']).default('xp'),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('50'),
  }),
});

// Milestone Schemas
export const shareMilestoneSchema = z.object({
  params: z.object({
    milestoneId: z.string(),
  }),
  body: z.object({
    visibility: z.enum(['public', 'friends', 'private']).default('friends'),
  }),
});

// Activity Feed Schemas
export const getActivityFeedSchema = z.object({
  query: z.object({
    userId: z.string().optional(),
    activityType: z.enum([
      'lesson_complete',
      'course_complete',
      'achievement_earned',
      'challenge_won',
      'level_up',
      'streak_milestone',
      'friend_added',
      'progress_shared',
    ]).optional(),
    visibility: z.enum(['public', 'friends', 'private']).optional(),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('20'),
    skip: z.string().transform(Number).pipe(z.number().min(0)).optional().default('0'),
  }),
});

export type CreateProgressShareInput = z.infer<typeof createProgressShareSchema>['body'];
export type UpdateProgressShareInput = z.infer<typeof updateProgressShareSchema>['body'];
export type AddReactionInput = z.infer<typeof addReactionSchema>['body'];
export type AddCommentInput = z.infer<typeof addCommentSchema>['body'];
export type GetProgressFeedQuery = z.infer<typeof getProgressFeedSchema>['query'];
export type UpdateProgressStatsInput = z.infer<typeof updateProgressStatsSchema>['body'];
export type GetLeaderboardQuery = z.infer<typeof getLeaderboardSchema>['query'];
export type GetActivityFeedQuery = z.infer<typeof getActivityFeedSchema>['query'];

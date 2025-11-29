import { z } from 'zod';

export const createChallengeSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    type: z.enum(['lesson', 'quiz', 'flashcard', 'streak', 'custom']),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    xpReward: z.number().min(1, 'XP reward must be positive'),
    coinsReward: z.number().min(0).optional(),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid start date',
    }),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid end date',
    }),
    requirements: z.object({
      type: z.string().min(1, 'Requirement type is required'),
      target: z.number().min(1, 'Target must be at least 1'),
    }),
    targetLesson: z.string().optional(),
    targetQuiz: z.string().optional(),
  }),
});

export const challengeFriendSchema = z.object({
  body: z.object({
    opponentId: z.string().min(1, 'Opponent ID is required'),
    challengeId: z.string().min(1, 'Challenge ID is required'),
  }),
});

export const respondToChallengeSchema = z.object({
  body: z.object({
    userChallengeId: z.string().min(1, 'User challenge ID is required'),
    action: z.enum(['accept', 'reject']),
  }),
});

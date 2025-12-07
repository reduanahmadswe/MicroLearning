import { z } from 'zod';

export const generateRoadmapSchema = z.object({
  body: z.object({
    goal: z.string().min(3, 'Goal must be at least 3 characters').max(500, 'Goal must be less than 500 characters'),
    currentLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
      errorMap: () => ({ message: 'Current level must be one of: beginner, intermediate, advanced, expert' })
    }).optional().default('intermediate'),
    timeCommitment: z.number({
      invalid_type_error: 'Time commitment must be a number',
    }).min(1, 'Time commitment must be at least 1 hour').max(168, 'Time commitment cannot exceed 168 hours').optional().default(10),
    targetDuration: z.number().min(1).max(260).optional().default(12),
    existingSkills: z.array(z.string()).optional(),
    learningStyle: z.enum(['visual', 'auditory', 'reading', 'kinesthetic', 'mixed']).optional(),
    preferences: z.object({
      includeProjects: z.boolean().optional(),
      includeCertifications: z.boolean().optional(),
      focusAreas: z.array(z.string()).optional(),
    }).optional(),
  }),
});

export const getRoadmapSchema = z.object({
  params: z.object({
    roadmapId: z.string(),
  }),
});

export const updateProgressSchema = z.object({
  params: z.object({
    roadmapId: z.string(),
  }),
  body: z.object({
    milestoneId: z.string(),
    status: z.enum(['locked', 'unlocked', 'in_progress', 'completed']),
    hoursSpent: z.number().optional(),
    notes: z.string().optional(),
  }),
});

export const deleteRoadmapSchema = z.object({
  params: z.object({
    roadmapId: z.string(),
  }),
});

export const getUserRoadmapsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
  }),
});

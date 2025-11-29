import { z } from 'zod';

export const generateRoadmapSchema = z.object({
  body: z.object({
    goal: z.string().min(5).max(500),
    currentLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    timeCommitment: z.number().min(1).max(168).optional(),
    targetDuration: z.number().min(1).max(260).optional(),
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

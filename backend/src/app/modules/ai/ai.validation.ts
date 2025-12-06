import { z } from 'zod';

/**
 * Lesson Generation Validation
 */
export const generateLessonSchema = z.object({
  body: z.object({
    topic: z.string().min(3, 'Topic must be at least 3 characters').max(200),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    language: z.string().optional().default('en'),
    duration: z.number().min(1).max(60).optional().default(10),
    includeSummary: z.boolean().optional().default(true),
    includeExamples: z.boolean().optional().default(true),
    targetAudience: z.string().optional(),
  }),
});

/**
 * Quiz Generation Validation
 */
export const generateQuizSchema = z.object({
  body: z.object({
    topic: z.string().min(3, 'Topic must be at least 3 characters').max(200),
    lessonContent: z.string().optional(),
    numberOfQuestions: z.number().min(1).max(50).default(10),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    questionTypes: z
      .array(z.enum(['multiple-choice', 'true-false', 'short-answer']))
      .optional()
      .default(['multiple-choice']),
    language: z.string().optional().default('en'),
  }),
});

/**
 * Flashcard Generation Validation
 */
export const generateFlashcardSchema = z.object({
  body: z.object({
    topic: z.string().min(3, 'Topic must be at least 3 characters').max(200),
    lessonContent: z.string().optional(),
    numberOfCards: z.number().min(1).max(100).optional().default(20),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
    includeExamples: z.boolean().optional().default(true),
    language: z.string().optional().default('en'),
  }),
});

/**
 * Chat Request Validation
 */
export const chatRequestSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message cannot be empty').max(2000),
    sessionId: z.string().optional(),
    context: z
      .object({
        lessonId: z.string().optional(),
        quizId: z.string().optional(),
        topic: z.string().optional(),
      })
      .optional(),
  }),
});

/**
 * Get Chat History Validation
 */
export const getChatHistorySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    sessionId: z.string().optional(),
  }),
});

/**
 * Content Improvement Validation
 */
export const improveContentSchema = z.object({
  body: z.object({
    content: z.string().min(10, 'Content must be at least 10 characters').max(10000),
    contentType: z.enum(['lesson', 'quiz', 'flashcard']),
    improvementType: z.enum(['clarity', 'grammar', 'structure', 'simplify', 'expand']),
    targetAudience: z.string().optional(),
  }),
});

/**
 * Topic Suggestion Validation
 */
export const topicSuggestionSchema = z.object({
  query: z.object({
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    limit: z.string().optional().default('10'),
  }),
});

/**
 * Get Generation History Validation
 */
export const getGenerationHistorySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    type: z.enum(['lesson', 'quiz', 'flashcard', 'chat']).optional(),
    status: z.enum(['success', 'failed', 'pending']).optional(),
  }),
});

/**
 * Delete Chat Session Validation
 */
export const deleteChatSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
  }),
});

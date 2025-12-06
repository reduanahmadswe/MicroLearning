import { z } from 'zod';

const quizQuestionSchema = z.object({
  type: z.enum(['mcq', 'true-false', 'fill-blank']),
  question: z.string().min(5, 'Question must be at least 5 characters'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string().min(10, 'Explanation must be at least 10 characters'),
  points: z.number().min(1).optional().default(1),
});

export const createQuizValidation = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(1000),
    course: z.string({
      required_error: 'Course ID is required - must select course first',
    }).min(1, 'Course ID is required'),
    lesson: z.string().optional(), // Optional for course-level quizzes (Quiz Arena)
    topic: z.string().min(2),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    questions: z.array(quizQuestionSchema).min(1).max(50),
    timeLimit: z.number().min(1).optional(),
    passingScore: z.number().min(0).max(100).optional().default(80),
    isPremium: z.boolean().optional().default(false),
  }),
});

export const generateQuizValidation = z.object({
  body: z.object({
    topic: z.string().min(3),
    lessonId: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    questionCount: z.number().min(1).max(20).optional().default(5),
    questionTypes: z.array(z.enum(['mcq', 'true-false', 'fill-blank'])).optional(),
  }),
});

export const submitQuizValidation = z.object({
  body: z.object({
    quizId: z.string(),
    answers: z.array(
      z.object({
        questionIndex: z.number().min(0),
        answer: z.union([z.string(), z.array(z.string())]),
      })
    ),
    timeTaken: z.number().min(0),
  }),
});

export type CreateQuizInput = z.infer<typeof createQuizValidation>['body'];
export type GenerateQuizInput = z.infer<typeof generateQuizValidation>['body'];
export type SubmitQuizInput = z.infer<typeof submitQuizValidation>['body'];

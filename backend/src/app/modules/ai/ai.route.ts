import { Router } from 'express';
import * as AIController from './ai.controller';
import authGuard from '../../middlewares/authGuard';
import validateRequest from '../../middlewares/validateRequest';
import {
  generateLessonSchema,
  generateQuizSchema,
  generateFlashcardSchema,
  chatRequestSchema,
  getChatHistorySchema,
  improveContentSchema,
  topicSuggestionSchema,
  getGenerationHistorySchema,
  deleteChatSessionSchema,
} from './ai.validation';

const router = Router();

/**
 * AI Content Generation Routes
 */

// Generate Lesson
router.post(
  '/generate/lesson',
  authGuard(),
  validateRequest(generateLessonSchema),
  AIController.generateLesson
);

// Generate Quiz
router.post(
  '/generate/quiz',
  authGuard(),
  validateRequest(generateQuizSchema),
  AIController.generateQuiz
);

// Generate Flashcards
router.post(
  '/generate/flashcards',
  authGuard(),
  validateRequest(generateFlashcardSchema),
  AIController.generateFlashcards
);

/**
 * AI Chat Tutor Routes
 */

// Chat with AI Tutor
router.post('/chat', authGuard(), validateRequest(chatRequestSchema), AIController.chat);

// Get Chat Sessions
router.get(
  '/chat/sessions',
  authGuard(),
  validateRequest(getChatHistorySchema),
  AIController.getChatSessions
);

// Get Chat Session Details
router.get('/chat/sessions/:sessionId', authGuard(), AIController.getChatSessionDetails);

// Delete Chat Session
router.delete(
  '/chat/sessions/:sessionId',
  authGuard(),
  validateRequest(deleteChatSessionSchema),
  AIController.deleteChatSession
);

/**
 * AI Content Improvement Routes
 */

// Improve Content
router.post(
  '/improve',
  authGuard(),
  validateRequest(improveContentSchema),
  AIController.improveContent
);

/**
 * AI Suggestions Routes
 */

// Get Topic Suggestions
router.get(
  '/suggestions/topics',
  authGuard(),
  validateRequest(topicSuggestionSchema),
  AIController.getTopicSuggestions
);

/**
 * AI Analytics Routes
 */

// Get AI Statistics
router.get('/stats', authGuard(), AIController.getAIStats);

// Get Generation History
router.get(
  '/history',
  authGuard(),
  validateRequest(getGenerationHistorySchema),
  AIController.getGenerationHistory
);

export default router;

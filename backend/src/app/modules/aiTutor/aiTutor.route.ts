import { Router } from 'express';
import * as AITutorController from './aiTutor.controller';
import * as AITutorValidation from './aiTutor.validation';
import { authGuard } from '../../../middleware/authGuard';
import { validateRequest } from '../../../middleware/validateRequest';

const router = Router();

/**
 * AI Tutor Chat Routes
 */

// Chat with AI Tutor
router.post(
  '/chat',
  authGuard(),
  validateRequest(AITutorValidation.chatRequestSchema),
  AITutorController.chat
);

// Get user's chat sessions
router.get(
  '/sessions',
  authGuard(),
  validateRequest(AITutorValidation.getSessionsSchema),
  AITutorController.getUserSessions
);

// Get specific session
router.get(
  '/sessions/:sessionId',
  authGuard(),
  validateRequest(AITutorValidation.getSessionSchema),
  AITutorController.getSession
);

// Delete session
router.delete(
  '/sessions/:sessionId',
  authGuard(),
  validateRequest(AITutorValidation.deleteSessionSchema),
  AITutorController.deleteSession
);

// Update session title
router.patch(
  '/sessions/:sessionId/title',
  authGuard(),
  validateRequest(AITutorValidation.updateSessionTitleSchema),
  AITutorController.updateSessionTitle
);

// Clear session messages
router.patch(
  '/sessions/:sessionId/clear',
  authGuard(),
  validateRequest(AITutorValidation.clearSessionSchema),
  AITutorController.clearSession
);

export default router;

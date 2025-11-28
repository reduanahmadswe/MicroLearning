import { Router } from 'express';
import progressController from './progress.controller';
import { validateRequest } from '../../../middleware/validateRequest';
import { updateProgressValidation } from './progress.validation';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// All routes are protected
router.post(
  '/update',
  authGuard(),
  validateRequest(updateProgressValidation),
  progressController.updateProgress
);

router.get('/me', authGuard(), progressController.getUserProgress);
router.get('/stats', authGuard(), progressController.getUserStats);
router.get('/timeline', authGuard(), progressController.getLearningTimeline);
router.get('/lesson/:lessonId', authGuard(), progressController.getLessonProgress);

export default router;

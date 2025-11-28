import { Router } from 'express';
import lessonController from './lesson.controller';
import { validateRequest } from '../../../middleware/validateRequest';
import {
  createLessonValidation,
  generateLessonValidation,
  updateLessonValidation,
  getLessonsValidation,
} from './lesson.validation';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// Public routes
router.get('/', validateRequest(getLessonsValidation), lessonController.getLessons);
router.get('/trending', lessonController.getTrendingLessons);
router.get('/:id', lessonController.getLessonById);

// Protected routes (authenticated users)
router.post(
  '/create',
  authGuard('learner', 'instructor', 'admin'),
  validateRequest(createLessonValidation),
  lessonController.createLesson
);

router.post(
  '/generate',
  authGuard('learner', 'instructor', 'admin'),
  validateRequest(generateLessonValidation),
  lessonController.generateLesson
);

router.put(
  '/:id',
  authGuard('learner', 'instructor', 'admin'),
  validateRequest(updateLessonValidation),
  lessonController.updateLesson
);

router.delete(
  '/:id',
  authGuard('learner', 'instructor', 'admin'),
  lessonController.deleteLesson
);

router.post('/:id/like', authGuard(), lessonController.likeLesson);
router.post('/:id/complete', authGuard(), lessonController.completeLesson);

router.get(
  '/recommendations/me',
  authGuard(),
  lessonController.getRecommendedLessons
);

export default router;

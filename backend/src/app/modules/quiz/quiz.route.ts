import { Router } from 'express';
import quizController from './quiz.controller';
import { validateRequest } from '../../../middleware/validateRequest';
import {
  createQuizValidation,
  generateQuizValidation,
  submitQuizValidation,
} from './quiz.validation';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// Public routes
router.get('/', quizController.getQuizzes);

// Instructor routes (must be before /:id route)
router.get('/instructor', authGuard('instructor', 'admin'), quizController.getInstructorQuizzes);

// Specific routes (MUST be before /:id to avoid conflicts)
router.get('/attempts/me', authGuard(), quizController.getUserAttempts);
router.get('/attempt/:id', authGuard(), quizController.getAttemptDetails);
router.get('/lesson/:lessonId', quizController.getQuizByLesson);
router.get('/stats', authGuard(), quizController.getQuizStatistics);

// Dynamic ID routes (MUST be after specific routes)
router.get('/:id', quizController.getQuizById);
router.get('/:id/attempts', authGuard(), quizController.getQuizAttempts);
router.get('/:id/results', authGuard('instructor', 'admin'), quizController.getQuizResults);

// Protected routes
router.post(
  '/create',
  authGuard('instructor', 'admin'),
  validateRequest(createQuizValidation),
  quizController.createQuiz
);

router.post(
  '/generate',
  authGuard('instructor', 'admin'),
  validateRequest(generateQuizValidation),
  quizController.generateQuiz
);

router.post(
  '/submit',
  authGuard(),
  validateRequest(submitQuizValidation),
  quizController.submitQuiz
);

// Instructor quiz management routes
router.put('/:id', authGuard('instructor', 'admin'), quizController.updateQuiz);
router.delete('/:id', authGuard('instructor', 'admin'), quizController.deleteQuiz);
router.post('/:id/duplicate', authGuard('instructor', 'admin'), quizController.duplicateQuiz);
router.patch('/:id/publish', authGuard('instructor', 'admin'), quizController.togglePublish);

export default router;

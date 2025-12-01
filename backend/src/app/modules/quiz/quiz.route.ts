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
router.get('/lesson/:lessonId', quizController.getQuizByLesson);
router.get('/:id', quizController.getQuizById);
router.get('/:id/attempts', authGuard(), quizController.getQuizAttempts);

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

router.get('/attempts/me', authGuard(), quizController.getUserAttempts);
router.get('/attempt/:id', authGuard(), quizController.getAttemptDetails);

export default router;

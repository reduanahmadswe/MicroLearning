import { Router } from 'express';
import flashcardController from './flashcard.controller';
import { validateRequest } from '../../../middleware/validateRequest';
import {
  createFlashcardValidation,
  generateFlashcardsValidation,
  reviewFlashcardValidation,
} from './flashcard.validation';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// All routes require authentication
router.post(
  '/create',
  authGuard(),
  validateRequest(createFlashcardValidation),
  flashcardController.createFlashcard
);

router.post(
  '/generate',
  authGuard(),
  validateRequest(generateFlashcardsValidation),
  flashcardController.generateFlashcards
);

router.get('/me', authGuard(), flashcardController.getFlashcards);
router.get('/due', authGuard(), flashcardController.getDueFlashcards);
router.get('/stats', authGuard(), flashcardController.getFlashcardStats);

router.post(
  '/review',
  authGuard(),
  validateRequest(reviewFlashcardValidation),
  flashcardController.reviewFlashcard
);

router.delete('/:id', authGuard(), flashcardController.deleteFlashcard);

export default router;

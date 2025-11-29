import { Router } from 'express';
import commentController from './comment.controller';
import { validateRequest } from '../../../middleware/validateRequest';
import {
  createCommentValidation,
  updateCommentValidation,
} from './comment.validation';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// Public routes
router.get('/lesson/:lessonId', commentController.getLessonComments);
router.get('/:commentId/replies', commentController.getCommentReplies);

// Protected routes
router.post(
  '/',
  authGuard(),
  validateRequest(createCommentValidation),
  commentController.createComment
);

router.get('/me', authGuard(), commentController.getUserComments);

router.put(
  '/:id',
  authGuard(),
  validateRequest(updateCommentValidation),
  commentController.updateComment
);

router.delete('/:id', authGuard(), commentController.deleteComment);

router.post('/:id/like', authGuard(), commentController.likeComment);

export default router;

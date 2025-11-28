import { Router } from 'express';
import bookmarkController from './bookmark.controller';
import { validateRequest } from '../../../middleware/validateRequest';
import { addBookmarkValidation, updateBookmarkValidation } from './bookmark.validation';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// All routes require authentication
router.post(
  '/add',
  authGuard(),
  validateRequest(addBookmarkValidation),
  bookmarkController.addBookmark
);

router.delete('/remove/:lessonId', authGuard(), bookmarkController.removeBookmark);

router.get('/me', authGuard(), bookmarkController.getUserBookmarks);

router.get('/lesson/:lessonId', authGuard(), bookmarkController.getBookmarkByLesson);

router.get('/check/:lessonId', authGuard(), bookmarkController.checkBookmark);

router.put(
  '/update/:lessonId',
  authGuard(),
  validateRequest(updateBookmarkValidation),
  bookmarkController.updateBookmark
);

router.get('/collections', authGuard(), bookmarkController.getCollections);

router.get('/stats', authGuard(), bookmarkController.getBookmarkStats);

export default router;

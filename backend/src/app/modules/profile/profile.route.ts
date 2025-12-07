import { Router } from 'express';
import profileController from './profile.controller';
import { validateRequest } from '../../../middleware/validateRequest';
import {
  updateProfileValidation,
  updatePreferencesValidation,
  changePasswordValidation,
  updateEmailValidation,
} from './profile.validation';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// Protected routes (authenticated users only)
router.get('/me', authGuard(), profileController.getMyProfile);
router.get('/me/badges', authGuard(), profileController.getMyBadges);
router.get('/me/statistics', authGuard(), profileController.getMyStatistics);

router.put(
  '/me',
  authGuard(),
  validateRequest(updateProfileValidation),
  profileController.updateMyProfile
);

router.put(
  '/me/preferences',
  authGuard(),
  validateRequest(updatePreferencesValidation),
  profileController.updateMyPreferences
);

router.put(
  '/me/password',
  authGuard(),
  validateRequest(changePasswordValidation),
  profileController.changePassword
);

router.put(
  '/me/email',
  authGuard(),
  validateRequest(updateEmailValidation),
  profileController.updateEmail
);

// Public routes
router.get('/search', profileController.searchUsers);
router.get('/:userId', profileController.getPublicProfile);

export default router;

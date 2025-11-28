import { Router } from 'express';
import badgeController from './badge.controller';
import { validateRequest } from '../../../middleware/validateRequest';
import { createBadgeValidation } from './badge.validation';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// Public routes
router.get('/', badgeController.getAllBadges);
router.get('/:id', badgeController.getBadgeById);

// Protected routes
router.get('/achievements/me', authGuard(), badgeController.getUserAchievements);
router.get('/earned/me', authGuard(), badgeController.getEarnedBadges);
router.get('/stats/me', authGuard(), badgeController.getAchievementStats);
router.post('/check', authGuard(), badgeController.checkAndAwardBadges);

// Admin routes
router.post(
  '/create',
  authGuard('admin'),
  validateRequest(createBadgeValidation),
  badgeController.createBadge
);
router.post('/initialize', authGuard('admin'), badgeController.initializeDefaultBadges);

export default router;

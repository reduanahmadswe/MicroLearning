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
router.patch('/admin/:badgeId', authGuard('admin'), badgeController.updateBadge);
router.delete('/admin/:badgeId', authGuard('admin'), badgeController.deleteBadge);
router.post('/admin/award', authGuard('admin'), badgeController.manuallyAwardBadge);
router.get('/admin/all', authGuard('admin'), badgeController.getAllBadgesAdmin);

export default router;

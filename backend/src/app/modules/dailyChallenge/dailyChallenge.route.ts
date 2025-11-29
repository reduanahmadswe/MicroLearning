import { Router } from 'express';
import { authGuard } from '../../../middleware/authGuard';
import { validateRequest } from '../../../middleware/validateRequest';
import dailyChallengeController from './dailyChallenge.controller';
import * as dailyChallengeValidation from './dailyChallenge.validation';

const router = Router();

// ==================== Daily Challenge Routes ====================

// Get active daily challenges
router.get(
  '/daily',
  authGuard(),
  validateRequest(dailyChallengeValidation.getActiveChallengesSchema),
  dailyChallengeController.getActiveDailyChallenges
);

// Get my daily challenges with progress
router.get(
  '/daily/my-challenges',
  authGuard(),
  dailyChallengeController.getMyDailyChallenges
);

// Get daily challenge by ID
router.get(
  '/daily/:challengeId',
  authGuard(),
  dailyChallengeController.getDailyChallengeById
);

// Update daily challenge progress
router.post(
  '/daily/progress',
  authGuard(),
  validateRequest(dailyChallengeValidation.updateChallengeProgressSchema),
  dailyChallengeController.updateDailyChallengeProgress
);

// Claim daily challenge rewards
router.post(
  '/daily/:challengeId/claim',
  authGuard(),
  validateRequest(dailyChallengeValidation.claimRewardsSchema),
  dailyChallengeController.claimDailyChallengeRewards
);

// Get challenge history
router.get(
  '/history',
  authGuard(),
  validateRequest(dailyChallengeValidation.getChallengeHistorySchema),
  dailyChallengeController.getChallengeHistory
);

// ==================== Weekly Challenge Routes ====================

// Get active weekly challenges
router.get(
  '/weekly',
  authGuard(),
  validateRequest(dailyChallengeValidation.getActiveChallengesSchema),
  dailyChallengeController.getActiveWeeklyChallenges
);

// Get my weekly challenges with progress
router.get(
  '/weekly/my-challenges',
  authGuard(),
  dailyChallengeController.getMyWeeklyChallenges
);

// Update weekly challenge progress
router.post(
  '/weekly/progress',
  authGuard(),
  validateRequest(dailyChallengeValidation.updateChallengeProgressSchema),
  dailyChallengeController.updateWeeklyChallengeProgress
);

// Claim weekly challenge rewards
router.post(
  '/weekly/:challengeId/claim',
  authGuard(),
  validateRequest(dailyChallengeValidation.claimRewardsSchema),
  dailyChallengeController.claimWeeklyChallengeRewards
);

// Get weekly challenge leaderboard
router.get(
  '/weekly/:challengeId/leaderboard',
  authGuard(),
  dailyChallengeController.getWeeklyChallengeLeaderboard
);

// ==================== Streak Routes ====================

// Get my streak
router.get(
  '/streak/me',
  authGuard(),
  dailyChallengeController.getMyStreak
);

// Get user streak
router.get(
  '/streak/:userId',
  authGuard(),
  validateRequest(dailyChallengeValidation.getStreakInfoSchema),
  dailyChallengeController.getUserStreak
);

// ==================== Admin Routes ====================

// Create daily challenge (admin only)
router.post(
  '/daily/admin/create',
  authGuard(),
  validateRequest(dailyChallengeValidation.createDailyChallengeSchema),
  dailyChallengeController.createDailyChallenge
);

// Create weekly challenge (admin only)
router.post(
  '/weekly/admin/create',
  authGuard(),
  validateRequest(dailyChallengeValidation.createWeeklyChallengeSchema),
  dailyChallengeController.createWeeklyChallenge
);

// Generate daily challenges (admin/cron job)
router.post(
  '/admin/generate-daily',
  authGuard(),
  dailyChallengeController.generateDailyChallenges
);

export default router;

import { Router } from 'express';
import { authGuard } from '../../../middleware/authGuard';
import { validateRequest } from '../../../middleware/validateRequest';
import progressController from './progress.controller';
import * as progressValidation from './progress.validation';

const router = Router();

// ==================== Progress Share Routes ====================

// Create progress share
router.post(
  '/shares',
  authGuard(),
  validateRequest(progressValidation.createProgressShareSchema),
  progressController.createProgressShare
);

// Get progress feed
router.get(
  '/shares/feed',
  authGuard(),
  validateRequest(progressValidation.getProgressFeedSchema),
  progressController.getProgressFeed
);

// Get single progress share
router.get(
  '/shares/:shareId',
  authGuard(),
  progressController.getProgressShare
);

// Update progress share
router.patch(
  '/shares/:shareId',
  authGuard(),
  validateRequest(progressValidation.updateProgressShareSchema),
  progressController.updateProgressShare
);

// Delete progress share
router.delete(
  '/shares/:shareId',
  authGuard(),
  progressController.deleteProgressShare
);

// Add reaction
router.post(
  '/shares/:shareId/reactions',
  authGuard(),
  validateRequest(progressValidation.addReactionSchema),
  progressController.addReaction
);

// Remove reaction
router.delete(
  '/shares/:shareId/reactions',
  authGuard(),
  progressController.removeReaction
);

// Add comment
router.post(
  '/shares/:shareId/comments',
  authGuard(),
  validateRequest(progressValidation.addCommentSchema),
  progressController.addComment
);

// Delete comment
router.delete(
  '/shares/:shareId/comments/:commentId',
  authGuard(),
  validateRequest(progressValidation.deleteCommentSchema),
  progressController.deleteComment
);

// ==================== Progress Stats Routes ====================

// Get my stats
router.get(
  '/stats/me',
  authGuard(),
  progressController.getMyStats
);

// Get user stats
router.get(
  '/stats/:userId',
  authGuard(),
  progressController.getUserStats
);

// Update my stats
router.patch(
  '/stats/me',
  authGuard(),
  validateRequest(progressValidation.updateProgressStatsSchema),
  progressController.updateMyStats
);

// Compare progress with another user
router.get(
  '/stats/compare/:userId',
  authGuard(),
  validateRequest(progressValidation.compareProgressSchema),
  progressController.compareWithUser
);

// ==================== Leaderboard Routes ====================

// Get leaderboard
router.get(
  '/leaderboard',
  authGuard(),
  validateRequest(progressValidation.getLeaderboardSchema),
  progressController.getLeaderboard
);

// ==================== Milestone Routes ====================

// Get my milestones
router.get(
  '/milestones/me',
  authGuard(),
  progressController.getMyMilestones
);

// Get user milestones
router.get(
  '/milestones/:userId',
  authGuard(),
  progressController.getUserMilestones
);

// Share milestone
router.post(
  '/milestones/:milestoneId/share',
  authGuard(),
  validateRequest(progressValidation.shareMilestoneSchema),
  progressController.shareMilestone
);

// ==================== Activity Feed Routes ====================

// Get activity feed
router.get(
  '/activity',
  authGuard(),
  validateRequest(progressValidation.getActivityFeedSchema),
  progressController.getActivityFeed
);

export default router;

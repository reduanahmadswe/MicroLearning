import { Router } from 'express';
import leaderboardController from './leaderboard.controller';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// Public routes
router.get('/global', leaderboardController.getGlobalLeaderboard);
router.get('/topic/:topic', leaderboardController.getTopicLeaderboard);

// Protected routes
router.get('/rank/me', authGuard(), leaderboardController.getUserRank);
router.get('/position/me', authGuard(), leaderboardController.getUserPosition);

// Admin routes
router.post('/admin/reset', authGuard('admin'), leaderboardController.resetLeaderboard);
router.patch('/admin/adjust/:userId', authGuard('admin'), leaderboardController.adjustUserScore);
router.get('/admin/stats', authGuard('admin'), leaderboardController.getLeaderboardStats);

export default router;

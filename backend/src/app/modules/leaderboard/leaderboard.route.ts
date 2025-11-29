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

export default router;

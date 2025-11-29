import { Router } from 'express';
import analyticsController from './analytics.controller';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// User analytics (protected)
router.get('/me', authGuard(), analyticsController.getUserAnalytics);
router.get('/insights', authGuard(), analyticsController.getLearningInsights);

// System analytics (admin only)
router.get('/system', authGuard('admin'), analyticsController.getSystemAnalytics);

export default router;

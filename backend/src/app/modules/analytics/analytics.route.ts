import { Router } from 'express';
import analyticsController from './analytics.controller';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// User analytics (protected)
router.get('/me', authGuard(), analyticsController.getUserAnalytics);
router.get('/insights', authGuard(), analyticsController.getLearningInsights);

// System analytics (admin only)
router.get('/system', authGuard('admin'), analyticsController.getSystemAnalytics);
router.get('/admin/revenue', authGuard('admin'), analyticsController.getRevenueAnalytics);
router.get('/admin/engagement', authGuard('admin'), analyticsController.getEngagementReport);
router.get('/admin/popular-content', authGuard('admin'), analyticsController.getPopularContent);
router.get('/admin/learning-trends', authGuard('admin'), analyticsController.getLearningTrends);
router.get('/admin/user-growth', authGuard('admin'), analyticsController.getUserGrowth);

export default router;

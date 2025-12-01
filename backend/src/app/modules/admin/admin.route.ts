import { Router } from 'express';
import adminController from './admin.controller';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// All routes require admin role
router.use(authGuard('admin'));

// Dashboard stats
router.get('/dashboard', adminController.getDashboardStats);
router.get('/content-stats', adminController.getContentStats);

// User management
router.get('/users', adminController.getUsers);
router.patch('/users/:userId/ban', adminController.banUser);
router.patch('/users/:userId/unban', adminController.unbanUser);
router.patch('/users/:userId/promote', adminController.promoteToInstructor);
router.patch('/users/:userId/demote', adminController.demoteToLearner);
router.delete('/users/:userId', adminController.deleteUser);

// System monitoring
router.get('/system/stats', adminController.getSystemStats);
router.get('/system/performance', adminController.getPerformanceMetrics);
router.get('/system/errors', adminController.getErrorLogs);
router.get('/system/database-health', adminController.getDatabaseHealth);

// Content moderation
router.get('/moderation/comments', adminController.getComments);
router.patch('/moderation/comments/:commentId', adminController.moderateComment);
router.get('/moderation/flagged', adminController.getFlaggedContent);
router.delete('/moderation/spam/:contentId', adminController.removeSpam);

export default router;

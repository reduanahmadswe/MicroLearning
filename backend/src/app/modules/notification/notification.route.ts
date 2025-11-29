import { Router } from 'express';
import notificationController from './notification.controller';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// All routes require authentication
router.get('/', authGuard(), notificationController.getUserNotifications);
router.get('/unread-count', authGuard(), notificationController.getUnreadCount);
router.put('/:id/read', authGuard(), notificationController.markAsRead);
router.put('/read-all', authGuard(), notificationController.markAllAsRead);
router.delete('/:id', authGuard(), notificationController.deleteNotification);

export default router;

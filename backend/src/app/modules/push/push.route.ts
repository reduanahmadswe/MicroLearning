import express from 'express';
import { PushController } from './push.controller';
import authGuard from '../../../middleware/authGuard';
import validateRequest from '../../../middleware/validateRequest';
import {
  registerDeviceSchema,
  sendNotificationSchema,
  sendBulkNotificationSchema,
  scheduleNotificationSchema,
} from './push.validation';

const router = express.Router();

// All routes require authentication
router.use(authGuard());

// Register device token
router.post('/register', validateRequest(registerDeviceSchema), PushController.registerDevice);

// Unregister device token
router.post('/unregister', PushController.unregisterDevice);

// Get user's devices
router.get('/devices', PushController.getUserDevices);

// Get push statistics
router.get('/stats', PushController.getPushStats);

// Admin routes
router.post(
  '/send',
  authGuard('admin'),
  validateRequest(sendNotificationSchema),
  PushController.sendNotification
);

router.post(
  '/send-bulk',
  authGuard('admin'),
  validateRequest(sendBulkNotificationSchema),
  PushController.sendBulkNotification
);

router.post(
  '/schedule',
  authGuard('admin'),
  validateRequest(scheduleNotificationSchema),
  PushController.scheduleNotification
);

export const PushRoutes = router;

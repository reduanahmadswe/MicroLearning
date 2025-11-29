import { DeviceToken, ScheduledNotification } from './push.model';
import {
  IRegisterDeviceRequest,
  IPushNotificationPayload,
  IBulkNotificationPayload,
} from './push.types';
import ApiError from '../../../utils/ApiError';
import httpStatus from 'http-status';

/**
 * Push Notification Service
 * 
 * This service provides push notification functionality.
 * 
 * IMPLEMENTATION STATUS: Template Ready - Requires Firebase Setup
 * 
 * TO ENABLE PUSH NOTIFICATIONS:
 * 
 * 1. Install Firebase Admin SDK:
 *    npm install firebase-admin
 * 
 * 2. Initialize Firebase in a separate config file (e.g., config/firebase.ts):
 * 
 *    import * as admin from 'firebase-admin';
 *    
 *    admin.initializeApp({
 *      credential: admin.credential.cert({
 *        projectId: process.env.FIREBASE_PROJECT_ID,
 *        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
 *        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
 *      }),
 *    });
 *    
 *    export const messaging = admin.messaging();
 * 
 * 3. Uncomment the Firebase code below and import messaging:
 *    import { messaging } from '../../../config/firebase';
 * 
 * 4. Add to .env:
 *    FIREBASE_PROJECT_ID=your-project-id
 *    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 *    FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
 */

// Register device token
const registerDevice = async (userId: string, data: IRegisterDeviceRequest) => {
  const { token, platform } = data;

  // Check if token already exists
  const existingToken = await DeviceToken.findOne({ token });

  if (existingToken) {
    // Update existing token
    existingToken.user = userId as any;
    existingToken.platform = platform;
    existingToken.isActive = true;
    existingToken.lastUsedAt = new Date();
    await existingToken.save();
    return existingToken;
  }

  // Create new token
  const deviceToken = await DeviceToken.create({
    user: userId,
    token,
    platform,
  });

  return deviceToken;
};

// Unregister device token
const unregisterDevice = async (userId: string, token: string) => {
  const deviceToken = await DeviceToken.findOne({ user: userId, token });

  if (!deviceToken) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device token not found');
  }

  deviceToken.isActive = false;
  await deviceToken.save();

  return { message: 'Device unregistered successfully' };
};

// Send push notification to a single user
const sendNotification = async (payload: IPushNotificationPayload) => {
  const { userId, title, body: _body, data: _data } = payload;

  // Get user's active device tokens
  const deviceTokens = await DeviceToken.find({
    user: userId,
    isActive: true,
  });

  if (deviceTokens.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No active devices found for this user');
  }

  const tokens = deviceTokens.map((dt) => dt.token);

  // TODO: Uncomment after Firebase setup
  // try {
  //   const message = {
  //     notification: {
  //       title,
  //       body,
  //     },
  //     data: data || {},
  //     tokens,
  //   };
  //
  //   const response = await messaging.sendMulticast(message);
  //
  //   // Handle failed tokens
  //   if (response.failureCount > 0) {
  //     const failedTokens: string[] = [];
  //     response.responses.forEach((resp, idx) => {
  //       if (!resp.success) {
  //         failedTokens.push(tokens[idx]);
  //       }
  //     });
  //
  //     // Deactivate failed tokens
  //     await DeviceToken.updateMany(
  //       { token: { $in: failedTokens } },
  //       { isActive: false }
  //     );
  //   }
  //
  //   return {
  //     success: response.successCount,
  //     failure: response.failureCount,
  //     total: tokens.length,
  //   };
  // } catch (error: any) {
  //   throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to send notification: ${error.message}`);
  // }

  // Placeholder response (remove after Firebase setup)
  console.log(`[PUSH] Would send to ${tokens.length} devices: ${title}`);
  return {
    success: tokens.length,
    failure: 0,
    total: tokens.length,
    note: 'Firebase not configured - notification logged only',
  };
};

// Send push notification to multiple users
const sendBulkNotification = async (payload: IBulkNotificationPayload) => {
  const { userIds } = payload;

  // Get all active device tokens for these users
  const deviceTokens = await DeviceToken.find({
    user: { $in: userIds },
    isActive: true,
  });

  if (deviceTokens.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No active devices found for these users');
  }

  const tokens = deviceTokens.map((dt) => dt.token);

  // TODO: Uncomment after Firebase setup
  // try {
  //   const message = {
  //     notification: {
  //       title,
  //       body,
  //     },
  //     data: data || {},
  //     tokens,
  //   };
  //
  //   const response = await messaging.sendMulticast(message);
  //
  //   // Handle failed tokens
  //   if (response.failureCount > 0) {
  //     const failedTokens: string[] = [];
  //     response.responses.forEach((resp, idx) => {
  //       if (!resp.success) {
  //         failedTokens.push(tokens[idx]);
  //       }
  //     });
  //
  //     await DeviceToken.updateMany(
  //       { token: { $in: failedTokens } },
  //       { isActive: false }
  //     );
  //   }
  //
  //   return {
  //     success: response.successCount,
  //     failure: response.failureCount,
  //     total: tokens.length,
  //   };
  // } catch (error: any) {
  //   throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to send notifications: ${error.message}`);
  // }

  // Placeholder response (remove after Firebase setup)
  console.log(`[PUSH BULK] Would send to ${tokens.length} devices: ${payload.title}`);
  return {
    success: tokens.length,
    failure: 0,
    total: tokens.length,
    note: 'Firebase not configured - notification logged only',
  };
};

// Schedule notification for later
const scheduleNotification = async (
  userId: string,
  title: string,
  body: string,
  scheduledAt: Date,
  data?: Record<string, any>
) => {
  const scheduled = await ScheduledNotification.create({
    user: userId,
    title,
    body,
    data,
    scheduledAt,
    status: 'pending',
  });

  return scheduled;
};

// Process scheduled notifications (called by cron job)
const processScheduledNotifications = async () => {
  const now = new Date();

  const pendingNotifications = await ScheduledNotification.find({
    status: 'pending',
    scheduledAt: { $lte: now },
  }).limit(100);

  const results = {
    processed: 0,
    sent: 0,
    failed: 0,
  };

  for (const notification of pendingNotifications) {
    try {
      await sendNotification({
        userId: notification.user.toString(),
        title: notification.title,
        body: notification.body,
        data: notification.data,
      });

      notification.status = 'sent';
      notification.sentAt = new Date();
      results.sent++;
    } catch (error: any) {
      notification.status = 'failed';
      notification.error = error.message;
      results.failed++;
    }

    await notification.save();
    results.processed++;
  }

  return results;
};

// Get user's device tokens
const getUserDevices = async (userId: string) => {
  const devices = await DeviceToken.find({ user: userId }).sort({ lastUsedAt: -1 });
  return devices;
};

// Get push notification statistics
const getPushStats = async (userId: string) => {
  const totalDevices = await DeviceToken.countDocuments({ user: userId });
  const activeDevices = await DeviceToken.countDocuments({ user: userId, isActive: true });

  const byPlatform = await DeviceToken.aggregate([
    { $match: { user: userId, isActive: true } },
    {
      $group: {
        _id: '$platform',
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    totalDevices,
    activeDevices,
    byPlatform: byPlatform.reduce((acc: any, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };
};

export const PushService = {
  registerDevice,
  unregisterDevice,
  sendNotification,
  sendBulkNotification,
  scheduleNotification,
  processScheduledNotifications,
  getUserDevices,
  getPushStats,
};

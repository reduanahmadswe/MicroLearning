export interface IDeviceToken {
  _id: string;
  user: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRegisterDeviceRequest {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

export interface IPushNotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface IBulkNotificationPayload {
  userIds: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface IScheduledNotification {
  _id: string;
  user: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  scheduledAt: Date;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Push Notification Service Types
 * 
 * This module provides types for push notification functionality using Firebase Cloud Messaging (FCM).
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Create Firebase Project:
 *    - Go to https://console.firebase.google.com/
 *    - Create a new project
 *    - Enable Cloud Messaging
 * 
 * 2. Get Service Account Key:
 *    - Go to Project Settings > Service Accounts
 *    - Generate new private key (downloads JSON file)
 *    - Save as firebase-service-account.json in backend root
 * 
 * 3. Install Firebase Admin SDK:
 *    npm install firebase-admin
 * 
 * 4. Add to .env:
 *    FIREBASE_PROJECT_ID=your-project-id
 *    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 *    FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
 * 
 * 5. Frontend Integration:
 *    - Web: Use Firebase JS SDK to get device token
 *    - iOS: Use Firebase iOS SDK
 *    - Android: Use Firebase Android SDK
 *    - Send token to POST /api/v1/push/register endpoint
 * 
 * 6. Testing:
 *    - Use Firebase Console > Cloud Messaging > Send test message
 *    - Or use POST /api/v1/push/send endpoint with admin role
 */

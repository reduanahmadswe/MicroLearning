# Installation Guide for New Modules

## Modules 24-26 Implementation

### New Modules Added:
1. **Module 24:** Progress Sharing System (`/api/v1/progress-share`)
2. **Module 25:** Daily Challenge System (`/api/v1/daily-challenges`)
3. **Module 26:** Email Notification Service (`/api/v1/email`)

---

## 📦 Required Packages

All required packages are already installed in your project:
- ✅ `http-status` - HTTP status codes
- ✅ `@types/http-status` - TypeScript definitions

---

## 🔧 Configuration Steps

### 1. Environment Variables

Add these to your `.env` file:

```env
# Email Service Configuration
EMAIL_PROVIDER=console              # Use 'sendgrid' for production
SENDGRID_API_KEY=                   # Your SendGrid API key (optional for dev)
EMAIL_FROM=noreply@microlearning.com
EMAIL_FROM_NAME=MicroLearning Platform
```

### 2. Initialize Email Templates

After starting the server, call this endpoint to create default email templates:

```bash
POST http://localhost:5000/api/v1/email/admin/initialize-templates
Authorization: Bearer <your-admin-token>
```

This will create:
- Welcome email template
- Challenge complete template
- More templates can be added via the API

---

## 🎮 Testing New Features

### 1. Progress Sharing System

```bash
# Get my progress stats
GET http://localhost:5000/api/v1/progress-share/stats/me
Authorization: Bearer <your-token>

# Create a progress share
POST http://localhost:5000/api/v1/progress-share/shares
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "shareType": "achievement",
  "title": "Completed 10 Lessons! 🎉",
  "description": "Just hit a major milestone!",
  "metadata": {
    "xpGained": 500
  },
  "visibility": "friends"
}

# Get progress feed
GET http://localhost:5000/api/v1/progress-share/shares/feed
Authorization: Bearer <your-token>

# Get leaderboard
GET http://localhost:5000/api/v1/progress-share/leaderboard?timeframe=weekly&category=xp
Authorization: Bearer <your-token>
```

### 2. Daily Challenge System

```bash
# Generate daily challenges (admin/cron)
POST http://localhost:5000/api/v1/daily-challenges/admin/generate-daily
Authorization: Bearer <your-admin-token>

# Get my daily challenges
GET http://localhost:5000/api/v1/daily-challenges/daily/my-challenges
Authorization: Bearer <your-token>

# Update challenge progress
POST http://localhost:5000/api/v1/daily-challenges/daily/progress
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "challengeId": "challenge_id_here",
  "progressIncrement": 1,
  "metadata": {
    "lessonsCompleted": ["lesson_id_1"]
  }
}

# Claim rewards
POST http://localhost:5000/api/v1/daily-challenges/daily/:challengeId/claim
Authorization: Bearer <your-token>

# Get my streak
GET http://localhost:5000/api/v1/daily-challenges/streak/me
Authorization: Bearer <your-token>

# Get weekly challenges
GET http://localhost:5000/api/v1/daily-challenges/weekly/my-challenges
Authorization: Bearer <your-token>
```

### 3. Email Notification Service

```bash
# Get my email preferences
GET http://localhost:5000/api/v1/email/preferences/me
Authorization: Bearer <your-token>

# Update email preferences
PATCH http://localhost:5000/api/v1/email/preferences/me
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "dailyReminder": true,
  "challengeComplete": true,
  "achievementUnlocked": true,
  "weeklySummary": false
}

# Send a test email
POST http://localhost:5000/api/v1/email/send
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "recipient": "user@example.com",
  "templateType": "challenge-complete",
  "variables": {
    "username": "John",
    "challengeName": "Complete 3 Lessons",
    "xpEarned": 100
  }
}

# Get email logs
GET http://localhost:5000/api/v1/email/logs
Authorization: Bearer <your-token>

# Get email statistics
GET http://localhost:5000/api/v1/email/stats
Authorization: Bearer <your-token>
```

---

## 🔄 Integration with Existing Features

### Auto-Update Progress Stats

When a user completes a lesson, quiz, or challenge, automatically update their progress stats:

```typescript
import progressService from './app/modules/progress/progress.service';

// After lesson completion
await progressService.updateProgressStats(userId, {
  lessonCompleted: true,
  xpGained: 50,
  studyTimeMinutes: 15
});

// After quiz completion
await progressService.updateProgressStats(userId, {
  xpGained: 100
});

// After challenge completion
await progressService.updateProgressStats(userId, {
  challengeWon: true,
  xpGained: 200
});
```

### Send Email Notifications

Integrate with your existing modules:

```typescript
import emailService from './app/modules/email/email.service';

// Send welcome email after registration
await emailService.sendEmail({
  userId: user._id,
  recipient: user.email,
  templateType: 'welcome',
  variables: {
    username: user.username,
    dashboardUrl: 'https://yourapp.com/dashboard'
  }
});

// Send challenge complete notification
await emailService.sendEmail({
  userId: user._id,
  recipient: user.email,
  templateType: 'challenge-complete',
  variables: {
    username: user.username,
    challengeName: challenge.name,
    xpEarned: challenge.rewards.xp
  }
});
```

### Update Daily Challenge Progress

Hook into lesson/quiz completion:

```typescript
import dailyChallengeService from './app/modules/dailyChallenge/dailyChallenge.service';

// After lesson completion
await dailyChallengeService.updateDailyChallengeProgress(userId, {
  challengeId: dailyChallenge._id,
  progressIncrement: 1,
  metadata: {
    lessonsCompleted: [lessonId]
  }
});

// After quiz completion with 80%+ score
await dailyChallengeService.updateDailyChallengeProgress(userId, {
  challengeId: dailyChallenge._id,
  progressIncrement: 1,
  metadata: {
    quizzesTaken: [quizId]
  }
});
```

---

## 🤖 Cron Jobs (Optional)

Set up cron jobs for automated tasks:

### 1. Generate Daily Challenges (Every day at midnight)

```typescript
import cron from 'node-cron';
import dailyChallengeService from './app/modules/dailyChallenge/dailyChallenge.service';

// Run at 00:00 every day
cron.schedule('0 0 * * *', async () => {
  console.log('Generating daily challenges...');
  await dailyChallengeService.generateDailyChallenges();
});
```

### 2. Send Daily Reminder Emails (Every day at 9 AM)

```typescript
// Run at 09:00 every day
cron.schedule('0 9 * * *', async () => {
  console.log('Sending daily reminder emails...');
  
  // Get all users with daily reminder enabled
  const users = await User.find({ /* active users */ });
  
  await emailService.sendBulkEmail({
    recipients: users.map(u => ({
      userId: u._id,
      email: u.email,
      variables: { username: u.username }
    })),
    templateType: 'daily-reminder',
    globalVariables: {}
  });
});
```

### 3. Send Weekly Summary Emails (Every Monday at 9 AM)

```typescript
// Run at 09:00 every Monday
cron.schedule('0 9 * * 1', async () => {
  console.log('Sending weekly summary emails...');
  
  // Get all users with weekly summary enabled
  const users = await User.find({ /* active users */ });
  
  for (const user of users) {
    const stats = await progressService.getUserStats(user._id);
    
    await emailService.sendEmail({
      userId: user._id,
      recipient: user.email,
      templateType: 'weekly-summary',
      variables: {
        username: user.username,
        lessonsCompleted: stats.completedLessons,
        xpEarned: stats.totalXP,
        currentStreak: stats.currentStreak
      }
    });
  }
});
```

---

## 📊 Database Collections

New collections created automatically:

### Progress Module (4 collections)
- `progressshares` - User progress shares
- `progressstats` - User progress statistics
- `progressmilestones` - Milestone achievements
- `activityfeeds` - Activity feed entries

### Daily Challenge Module (5 collections)
- `dailychallenges` - Daily challenge definitions
- `dailychallengeprogresses` - User progress on daily challenges
- `dailychallengestreaks` - User streak information
- `weeklychallenges` - Weekly challenge definitions
- `weeklychallengeprogresses` - User progress on weekly challenges

### Email Module (3 collections)
- `emailtemplates` - Email template definitions
- `emaillogs` - Email send logs
- `emailpreferences` - User email preferences

**Total New Collections:** 12

---

## ✅ Verification Checklist

After implementation, verify:

- [ ] All 3 new routes are registered in `app.ts`
- [ ] MongoDB connection is working
- [ ] JWT authentication is working for all routes
- [ ] Email templates are initialized
- [ ] Daily challenges can be generated
- [ ] Progress stats are being tracked
- [ ] Console email provider works in development
- [ ] All validation schemas are working

---

## 🐛 Troubleshooting

### Issue: Routes not found (404)
**Solution:** Check that routes are imported and registered in `src/config/app.ts`

### Issue: Email not sending
**Solution:** 
1. Check `EMAIL_PROVIDER` is set to `console` for development
2. For production, ensure `SENDGRID_API_KEY` is configured
3. Check email logs: `GET /api/v1/email/logs`

### Issue: Daily challenges not generated
**Solution:**
1. Call generate endpoint manually: `POST /api/v1/daily-challenges/admin/generate-daily`
2. Check MongoDB connection
3. Verify user has admin permissions

### Issue: Progress stats not updating
**Solution:**
1. Ensure `updateProgressStats` is called after lesson/quiz completion
2. Check MongoDB indexes are created
3. Verify user authentication

---

## 📚 Additional Resources

- **Implementation Status:** See `IMPLEMENTATION_STATUS.md`
- **Feature Checklist:** See `FEATURE_CHECKLIST.md`
- **API Documentation:** Use Postman collection or generate with Swagger

---

## 🎉 You're All Set!

Your MicroLearning platform now has:
- ✅ Complete Progress Sharing & Social Features
- ✅ Daily & Weekly Challenge System with Rewards
- ✅ Email Notification Service with Template Management

**Total New Features:** 52 endpoints across 3 modules
**Total New Collections:** 12 MongoDB collections

Happy coding! 🚀

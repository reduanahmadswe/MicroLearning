# 📧 Email Configuration with Nodemailer

এই প্রজেক্টে **Nodemailer** ব্যবহার করে email পাঠানো হয়। নিচে বিভিন্ন email provider এর জন্য configuration দেওয়া আছে।

---

## 🔧 Environment Variables

আপনার `.env` ফাইলে নিচের variables যোগ করুন:

### 1️⃣ **Gmail Configuration (প্রস্তাবিত)**

```env
# Email Provider
EMAIL_PROVIDER=gmail

# Gmail Credentials
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Email From
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=MicroLearning Platform
```

#### Gmail App Password কীভাবে তৈরি করবেন:

1. আপনার Google Account এ যান: https://myaccount.google.com/
2. **Security** > **2-Step Verification** চালু করুন (যদি আগে না করা থাকে)
3. **App passwords** এ যান: https://myaccount.google.com/apppasswords
4. **Select app** > **Other (Custom name)** > "MicroLearning" লিখুন
5. **Generate** বাটনে ক্লিক করুন
6. 16-digit password কপি করে `.env` ফাইলে `EMAIL_PASS` এ দিন

---

### 2️⃣ **Outlook/Office365 Configuration**

```env
# Email Provider
EMAIL_PROVIDER=outlook

# Outlook Credentials
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password

# Email From
EMAIL_FROM=your-email@outlook.com
EMAIL_FROM_NAME=MicroLearning Platform
```

---

### 3️⃣ **Custom SMTP Configuration**

```env
# Email Provider
EMAIL_PROVIDER=custom

# SMTP Settings
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false

# SMTP Credentials
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password

# Email From
EMAIL_FROM=noreply@domain.com
EMAIL_FROM_NAME=MicroLearning Platform
```

---

### 4️⃣ **Development/Testing (Console Only)**

টেস্টিং এর জন্য আসল email না পাঠিয়ে শুধু console এ দেখতে চাইলে:

```env
# Email Provider
EMAIL_PROVIDER=console
NODE_ENV=development
```

---

## 🧪 Testing Email (Mailtrap)

Development এর সময় আসল email না পাঠিয়ে test করতে চাইলে **Mailtrap** ব্যবহার করুন:

1. https://mailtrap.io/ তে একাউন্ট তৈরি করুন (ফ্রি)
2. **Inbox** তৈরি করুন
3. SMTP credentials কপি করুন
4. `.env` ফাইলে যোগ করুন:

```env
EMAIL_PROVIDER=custom

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false

EMAIL_USER=your-mailtrap-username
EMAIL_PASS=your-mailtrap-password

EMAIL_FROM=noreply@microlearning.com
EMAIL_FROM_NAME=MicroLearning Platform
```

---

## 📨 Email Template Types

প্রজেক্টে নিচের email template গুলো পাঠানো যাবে:

### 1. **Welcome Email**
```typescript
await sendEmail({
  recipient: 'user@example.com',
  templateType: 'welcome',
  variables: {
    username: 'John Doe',
    dashboardUrl: 'https://microlearning.com/dashboard'
  }
});
```

### 2. **Password Reset**
```typescript
await sendEmail({
  recipient: 'user@example.com',
  templateType: 'reset-password',
  variables: {
    username: 'John Doe',
    resetLink: 'https://microlearning.com/reset?token=xyz',
    expiryTime: '1 hour'
  }
});
```

### 3. **Challenge Complete**
```typescript
await sendEmail({
  userId: 'user-id',
  recipient: 'user@example.com',
  templateType: 'challenge-complete',
  variables: {
    username: 'John Doe',
    challengeName: 'Python Basics',
    xpEarned: '100'
  }
});
```

### 4. **Achievement Unlocked**
```typescript
await sendEmail({
  userId: 'user-id',
  recipient: 'user@example.com',
  templateType: 'achievement-unlocked',
  variables: {
    username: 'John Doe',
    badgeName: '7-Day Streak Master',
    badgeIcon: '🔥'
  }
});
```

### 5. **Daily Reminder**
```typescript
await sendEmail({
  userId: 'user-id',
  recipient: 'user@example.com',
  templateType: 'daily-reminder',
  variables: {
    username: 'John Doe',
    streakDays: '5',
    dashboardUrl: 'https://microlearning.com/dashboard'
  }
});
```

### 6. **Course Complete**
```typescript
await sendEmail({
  userId: 'user-id',
  recipient: 'user@example.com',
  templateType: 'course-complete',
  variables: {
    username: 'John Doe',
    courseName: 'JavaScript Masterclass',
    certificateUrl: 'https://microlearning.com/certificate/xyz'
  }
});
```

### 7. **Weekly Summary**
```typescript
await sendEmail({
  userId: 'user-id',
  recipient: 'user@example.com',
  templateType: 'weekly-summary',
  variables: {
    username: 'John Doe',
    lessonsCompleted: '15',
    xpEarned: '500',
    rank: '12'
  }
});
```

---

## 🚀 Usage Examples

### একটি Email পাঠানো:
```typescript
import { sendEmail } from './app/modules/email/email.service';

await sendEmail({
  recipient: 'user@example.com',
  templateType: 'welcome',
  variables: {
    username: 'John Doe',
    dashboardUrl: 'https://microlearning.com/dashboard'
  }
});
```

### Bulk Email পাঠানো:
```typescript
import { sendBulkEmail } from './app/modules/email/email.service';

await sendBulkEmail({
  templateType: 'weekly-summary',
  recipients: [
    {
      email: 'user1@example.com',
      variables: { username: 'User 1', lessonsCompleted: '10' }
    },
    {
      email: 'user2@example.com',
      variables: { username: 'User 2', lessonsCompleted: '15' }
    }
  ],
  globalVariables: {
    year: '2025'
  }
});
```

### Scheduled Email:
```typescript
await sendEmail({
  recipient: 'user@example.com',
  templateType: 'daily-reminder',
  variables: { username: 'John' },
  scheduledAt: new Date('2025-12-01T09:00:00Z')
});
```

---

## 🔍 Email Tracking

Email tracking এর জন্য:

```typescript
import { trackEmailEvent } from './app/modules/email/email.service';

// Email খোলা হলে
await trackEmailEvent('message-id-123', 'open');

// Link click হলে
await trackEmailEvent('message-id-123', 'click');

// Bounce হলে
await trackEmailEvent('message-id-123', 'bounce');
```

---

## 📊 Email Statistics

Email statistics দেখতে:

```typescript
import { getEmailStats } from './app/modules/email/email.service';

const stats = await getEmailStats(); // All emails
const userStats = await getEmailStats('user-id'); // User-specific

console.log(stats);
// {
//   totalSent: 100,
//   totalFailed: 2,
//   totalOpened: 75,
//   totalClicked: 30,
//   openRate: 75,
//   clickRate: 30,
//   byTemplate: [...]
// }
```

---

## ⚙️ User Email Preferences

Users তাদের email preferences manage করতে পারবে:

```typescript
import { 
  updateEmailPreferences, 
  unsubscribeFromAll 
} from './app/modules/email/email.service';

// Specific preference update
await updateEmailPreferences('user-id', {
  dailyReminder: false,
  weeklySummary: true
});

// Unsubscribe from all emails
await unsubscribeFromAll('user-id');
```

---

## 🛠️ Troubleshooting

### Gmail "Less secure app access" error:
- Gmail এ **App Password** ব্যবহার করুন (উপরে দেখুন)
- 2-Step Verification enable করতে হবে

### "Connection timeout" error:
- `SMTP_PORT` চেক করুন (Gmail: 587, Outlook: 587)
- Firewall/antivirus email port block করছে কিনা দেখুন

### Emails spam folder এ যাচ্ছে:
- SPF, DKIM, DMARC records সেটাপ করুন (domain email এর জন্য)
- Email content এ spammy words এড়িয়ে চলুন
- Verified domain ব্যবহার করুন

### Development এ test করতে:
- **Mailtrap** ব্যবহার করুন (উপরে দেখুন)
- অথবা `EMAIL_PROVIDER=console` সেট করুন

---

## 📝 Notes

1. **Production এ Gmail ব্যবহার না করা ভালো** - প্রতিদিন সীমিত email পাঠানো যায় (500/day)
2. **SendGrid/AWS SES** ব্যবহার করা ভালো production এর জন্য
3. Always use **App Passwords** for Gmail, not your actual password
4. Email templates MongoDB তে store করা আছে - Admin panel থেকে edit করা যাবে

---

## 🎯 Next Steps

1. `.env` ফাইলে email configuration যোগ করুন
2. `npm install` রান করে nodemailer ইনস্টল করুন
3. Email templates initialize করুন: `POST /api/email/init-templates`
4. Test email পাঠান: `POST /api/email/send`

---

Happy Emailing! 📧✨

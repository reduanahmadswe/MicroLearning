# 🚀 Nodemailer Setup - Quick Start Guide

এই গাইড follow করে আপনি খুব সহজেই **Nodemailer** দিয়ে email পাঠাতে পারবেন।

---

## 📦 Installation

```powershell
cd backend
npm install
```

এটা `nodemailer` এবং `@types/nodemailer` ইনস্টল করবে।

---

## ⚙️ Configuration

### Step 1: `.env` ফাইল তৈরি করুন

`backend` ফোল্ডারে `.env` ফাইল তৈরি করুন এবং নিচের তথ্য যোগ করুন:

```env
# Email Configuration
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=MicroLearning Platform
```

### Step 2: Gmail App Password তৈরি করুন

1. https://myaccount.google.com/security এ যান
2. **2-Step Verification** চালু করুন
3. **App passwords** এ যান: https://myaccount.google.com/apppasswords
4. "MicroLearning" নামে একটি app password তৈরি করুন
5. 16-digit password কপি করে `.env` এ `EMAIL_PASS` এ paste করুন

---

## 🧪 Testing

### Method 1: Test Endpoint দিয়ে

Server চালু করুন:
```powershell
npm run dev
```

Postman/Thunder Client দিয়ে test করুন:

**POST** `https://microlearnignbackend.vercel.app/api/email/test`

Body (JSON):
```json
{
  "recipient": "your-test-email@gmail.com"
}
```

### Method 2: Initialize Templates এবং Send Email

#### Step 1: Templates Initialize করুন

**POST** `https://microlearnignbackend.vercel.app/api/email/admin/initialize-templates`

Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Step 2: Email পাঠান

**POST** `https://microlearnignbackend.vercel.app/api/email/send`

Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Body (JSON):
```json
{
  "recipient": "user@example.com",
  "templateType": "welcome",
  "variables": {
    "username": "John Doe",
    "dashboardUrl": "http://localhost:3000/dashboard"
  }
}
```

---

## 📧 Available Email Templates

| Template Type | Variables | Purpose |
|--------------|-----------|---------|
| `welcome` | `username`, `dashboardUrl` | Welcome new users |
| `reset-password` | `username`, `resetLink`, `expiryTime` | Password reset |
| `challenge-complete` | `username`, `challengeName`, `xpEarned` | Challenge completion |
| `achievement-unlocked` | `username`, `badgeName`, `badgeIcon` | Achievement notification |
| `daily-reminder` | `username`, `streakDays`, `dashboardUrl` | Daily learning reminder |
| `course-complete` | `username`, `courseName`, `certificateUrl` | Course completion |
| `weekly-summary` | `username`, `lessonsCompleted`, `xpEarned`, `rank` | Weekly progress |

---

## 🔧 Different Email Providers

### Gmail (Default)
```env
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Outlook/Office365
```env
EMAIL_PROVIDER=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Mailtrap (Testing)
```env
EMAIL_PROVIDER=custom
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
EMAIL_USER=your-mailtrap-username
EMAIL_PASS=your-mailtrap-password
```

### Console (Development - No Real Email)
```env
EMAIL_PROVIDER=console
NODE_ENV=development
```

---

## 📊 API Endpoints

### Email Sending
- `POST /api/email/test` - Send test email (no auth)
- `POST /api/email/send` - Send single email
- `POST /api/email/send-bulk` - Send bulk emails

### Templates
- `GET /api/email/templates` - Get all templates
- `GET /api/email/templates/:id` - Get template by ID
- `POST /api/email/templates` - Create template (admin)
- `PATCH /api/email/templates/:id` - Update template (admin)
- `DELETE /api/email/templates/:id` - Delete template (admin)

### Preferences
- `GET /api/email/preferences/me` - Get my preferences
- `PATCH /api/email/preferences/me` - Update preferences
- `POST /api/email/preferences/unsubscribe` - Unsubscribe all

### Analytics
- `GET /api/email/logs` - Get email logs
- `GET /api/email/stats` - Get email statistics
- `POST /api/email/track` - Track email events

### Admin
- `POST /api/email/admin/initialize-templates` - Initialize default templates

---

## 🐛 Troubleshooting

### ❌ Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution:** Gmail App Password ব্যবহার করুন, regular password নয়

### ❌ Error: "Connection timeout"

**Solution:** 
- Port check করুন (Gmail: 587)
- Firewall/Antivirus check করুন
- Internet connection check করুন

### ❌ Emails not sending

**Solution:**
1. `.env` ফাইল check করুন
2. Server restart করুন
3. Console logs check করুন
4. Email provider credentials verify করুন

### ❌ Emails going to spam

**Solution:**
- Development এ এটা normal
- Production এ proper domain এবং SPF records সেটাপ করুন
- Verified sender email ব্যবহার করুন

---

## 💡 Code Examples

### Send Welcome Email
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

### Send Bulk Emails
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
  ]
});
```

### Check Email Stats
```typescript
import { getEmailStats } from './app/modules/email/email.service';

const stats = await getEmailStats();
console.log(`Total sent: ${stats.totalSent}`);
console.log(`Open rate: ${stats.openRate}%`);
```

---

## ✅ Verification Checklist

- [ ] Nodemailer installed (`npm install`)
- [ ] `.env` file configured with email credentials
- [ ] Gmail App Password created (if using Gmail)
- [ ] Server running (`npm run dev`)
- [ ] Templates initialized (`POST /api/email/admin/initialize-templates`)
- [ ] Test email sent successfully (`POST /api/email/test`)
- [ ] Received test email in inbox

---

## 🎯 Next Steps

1. ✅ Configure `.env` with your email credentials
2. ✅ Run `npm install`
3. ✅ Start server with `npm run dev`
4. ✅ Initialize templates using API
5. ✅ Send test email
6. 🚀 Integrate email sending in your application logic

---

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Mailtrap for Testing](https://mailtrap.io/)
- Full setup guide: `EMAIL_SETUP.md`

---

**Happy Emailing! 📧✨**

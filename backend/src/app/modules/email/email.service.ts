import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError';
import { EmailTemplate, EmailLog, EmailPreference } from './email.model';
import {
  SendEmailInput,
  SendBulkEmailInput,
  CreateEmailTemplateInput,
  UpdateEmailPreferencesInput,
  GetEmailLogsQuery,
  EmailStats,
} from './email.types';

// ==================== Email Provider Configuration ====================

interface EmailProvider {
  send: (to: string, subject: string, html: string, text: string) => Promise<{
    messageId: string;
    status: string;
  }>;
}

// SendGrid Provider (requires @sendgrid/mail package)
class SendGridProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@microlearning.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'MicroLearning Platform';
  }

  async send(to: string, subject: string, html: string, text: string) {
    if (!this.apiKey) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'SendGrid API key not configured'
      );
    }

    try {
      // Note: Actual SendGrid integration would use @sendgrid/mail
      // For now, this is a placeholder structure
      console.log('[SendGrid] Sending email:', {
        to,
        subject,
        from: `${this.fromName} <${this.fromEmail}>`,
      });

      // Simulated response
      return {
        messageId: `sendgrid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'sent',
      };

      /* Actual SendGrid implementation:
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(this.apiKey);
      
      const msg = {
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject,
        text,
        html,
      };
      
      const [response] = await sgMail.send(msg);
      return {
        messageId: response.headers['x-message-id'],
        status: 'sent',
      };
      */
    } catch (error: any) {
      console.error('[SendGrid] Error:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }
}

// Console Provider (for development)
class ConsoleProvider implements EmailProvider {
  async send(to: string, subject: string, html: string, text: string) {
    console.log('\n==================== EMAIL ====================');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html.substring(0, 200) + '...');
    console.log('Text:', text.substring(0, 200) + '...');
    console.log('================================================\n');

    return {
      messageId: `console-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
    };
  }
}

// Provider Factory
const getEmailProvider = (): EmailProvider => {
  const provider = process.env.EMAIL_PROVIDER || 'console';

  switch (provider) {
    case 'sendgrid':
      return new SendGridProvider();
    case 'console':
    default:
      return new ConsoleProvider();
  }
};

// ==================== Email Sending Services ====================

export const sendEmail = async (emailData: SendEmailInput) => {
  const { userId, recipient, templateType, variables, scheduledAt } = emailData;

  // Get template
  const template = await EmailTemplate.findOne({
    templateType,
    isActive: true,
  });

  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, `Email template '${templateType}' not found`);
  }

  // Check user preferences if userId provided
  if (userId) {
    const canSend = await checkEmailPreference(userId, templateType);
    if (!canSend) {
      return {
        status: 'blocked',
        message: 'User has disabled this email type',
      };
    }
  }

  // Replace variables in template
  let subject = template.subject;
  let htmlContent = template.htmlContent;
  let textContent = template.textContent;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
    htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
    textContent = textContent.replace(new RegExp(placeholder, 'g'), String(value));
  }

  // Create email log
  const emailLog = await EmailLog.create({
    userId: userId || null,
    templateType,
    recipient,
    subject,
    status: scheduledAt ? 'pending' : 'pending',
    provider: process.env.EMAIL_PROVIDER || 'console',
    metadata: { variables, scheduledAt },
  });

  // Send email if not scheduled
  if (!scheduledAt) {
    try {
      const provider = getEmailProvider();
      const result = await provider.send(recipient, subject, htmlContent, textContent);

      emailLog.status = 'sent';
      emailLog.messageId = result.messageId;
      emailLog.sentAt = new Date();
      await emailLog.save();

      return {
        status: 'sent',
        messageId: result.messageId,
        emailLogId: emailLog._id,
      };
    } catch (error: any) {
      emailLog.status = 'failed';
      emailLog.errorMessage = error.message;
      await emailLog.save();

      throw error;
    }
  }

  return {
    status: 'scheduled',
    scheduledAt,
    emailLogId: emailLog._id,
  };
};

export const sendBulkEmail = async (bulkEmailData: SendBulkEmailInput) => {
  const { recipients, templateType, globalVariables = {} } = bulkEmailData;

  const results = await Promise.allSettled(
    recipients.map((recipient) =>
      sendEmail({
        userId: recipient.userId,
        recipient: recipient.email,
        templateType,
        variables: {
          ...globalVariables,
          ...(recipient.variables || {}),
        },
      })
    )
  );

  const summary = {
    total: recipients.length,
    sent: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
    blocked: results.filter(
      (r) => r.status === 'fulfilled' && (r.value as any).status === 'blocked'
    ).length,
  };

  return summary;
};

// ==================== Email Template Services ====================

export const createEmailTemplate = async (templateData: CreateEmailTemplateInput) => {
  const template = await EmailTemplate.create(templateData);
  return template;
};

export const getEmailTemplate = async (templateId: string) => {
  const template = await EmailTemplate.findById(templateId);

  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Email template not found');
  }

  return template;
};

export const getAllEmailTemplates = async () => {
  const templates = await EmailTemplate.find().sort({ templateType: 1 });
  return templates;
};

export const updateEmailTemplate = async (
  templateId: string,
  updateData: Partial<CreateEmailTemplateInput>
) => {
  const template = await EmailTemplate.findByIdAndUpdate(templateId, updateData, {
    new: true,
  });

  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Email template not found');
  }

  return template;
};

export const deleteEmailTemplate = async (templateId: string) => {
  const template = await EmailTemplate.findByIdAndDelete(templateId);

  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Email template not found');
  }

  return template;
};

// ==================== Email Preference Services ====================

export const getOrCreateEmailPreferences = async (userId: string) => {
  let preferences = await EmailPreference.findOne({ userId });

  if (!preferences) {
    preferences = await EmailPreference.create({
      userId,
      preferences: {
        dailyReminder: true,
        challengeComplete: true,
        achievementUnlocked: true,
        courseComplete: true,
        weeklySummary: true,
        friendActivity: true,
        marketplaceUpdates: false,
        systemAnnouncements: true,
      },
    });
  }

  return preferences;
};

export const updateEmailPreferences = async (
  userId: string,
  updateData: UpdateEmailPreferencesInput
) => {
  const preferences = await getOrCreateEmailPreferences(userId);

  Object.assign(preferences.preferences, updateData);
  await preferences.save();

  return preferences;
};

export const unsubscribeFromAll = async (userId: string) => {
  const preferences = await getOrCreateEmailPreferences(userId);

  // Disable all email types
  preferences.preferences = {
    dailyReminder: false,
    challengeComplete: false,
    achievementUnlocked: false,
    courseComplete: false,
    weeklySummary: false,
    friendActivity: false,
    marketplaceUpdates: false,
    systemAnnouncements: false,
  };
  preferences.unsubscribedAt = new Date();
  await preferences.save();

  return preferences;
};

const checkEmailPreference = async (
  userId: string,
  templateType: string
): Promise<boolean> => {
  const preferences = await getOrCreateEmailPreferences(userId);

  if (preferences.unsubscribedAt) {
    return false; // User unsubscribed from all emails
  }

  // Map template types to preference keys
  const preferenceMap: Record<string, keyof typeof preferences.preferences> = {
    'daily-reminder': 'dailyReminder',
    'challenge-complete': 'challengeComplete',
    'achievement-unlocked': 'achievementUnlocked',
    'course-complete': 'courseComplete',
    'weekly-summary': 'weeklySummary',
    'custom': 'systemAnnouncements',
  };

  const preferenceKey = preferenceMap[templateType];

  if (!preferenceKey) {
    return true; // Always send system emails (welcome, reset-password)
  }

  return preferences.preferences[preferenceKey];
};

// ==================== Email Log Services ====================

export const getEmailLogs = async (query: GetEmailLogsQuery) => {
  const { userId, status, templateType, limit = 20, skip = 0 } = query;

  const filter: any = {};

  if (userId) {
    filter.userId = userId;
  }

  if (status) {
    filter.status = status;
  }

  if (templateType) {
    filter.templateType = templateType;
  }

  const [logs, total] = await Promise.all([
    EmailLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'username email'),
    EmailLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    },
  };
};

export const getEmailStats = async (userId?: string): Promise<EmailStats> => {
  const filter: any = {};
  if (userId) {
    filter.userId = userId;
  }

  const [totalSent, totalFailed, totalOpened, totalClicked, byTemplate] = await Promise.all([
    EmailLog.countDocuments({ ...filter, status: 'sent' }),
    EmailLog.countDocuments({ ...filter, status: 'failed' }),
    EmailLog.countDocuments({ ...filter, openedAt: { $exists: true } }),
    EmailLog.countDocuments({ ...filter, clickedAt: { $exists: true } }),
    EmailLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$templateType',
          sent: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] },
          },
          opened: {
            $sum: { $cond: [{ $ne: ['$openedAt', null] }, 1, 0] },
          },
          clicked: {
            $sum: { $cond: [{ $ne: ['$clickedAt', null] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  return {
    totalSent,
    totalFailed,
    totalOpened,
    totalClicked,
    openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
    byTemplate: byTemplate.map((t) => ({
      templateType: t._id,
      sent: t.sent,
      opened: t.opened,
      clicked: t.clicked,
    })),
  };
};

export const trackEmailEvent = async (
  messageId: string,
  event: 'open' | 'click' | 'bounce' | 'spam',
  timestamp?: Date
) => {
  const emailLog = await EmailLog.findOne({ messageId });

  if (!emailLog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Email log not found');
  }

  const eventTime = timestamp || new Date();

  switch (event) {
    case 'open':
      if (!emailLog.openedAt) {
        emailLog.openedAt = eventTime;
      }
      break;
    case 'click':
      emailLog.clickedAt = eventTime;
      if (!emailLog.openedAt) {
        emailLog.openedAt = eventTime; // Auto-mark as opened
      }
      break;
    case 'bounce':
      emailLog.status = 'bounced';
      break;
    case 'spam':
      emailLog.status = 'bounced';
      emailLog.errorMessage = 'Marked as spam';
      break;
  }

  await emailLog.save();
  return emailLog;
};

// ==================== Helper Functions ====================

export const initializeDefaultTemplates = async () => {
  const defaultTemplates = [
    {
      templateType: 'welcome' as const,
      name: 'Welcome Email',
      subject: 'Welcome to MicroLearning Platform, {{username}}!',
      htmlContent: `
        <h1>Welcome {{username}}!</h1>
        <p>We're excited to have you on board. Start your learning journey today!</p>
        <a href="{{dashboardUrl}}">Go to Dashboard</a>
      `,
      textContent: 'Welcome {{username}}! We\'re excited to have you on board.',
      variables: ['username', 'dashboardUrl'],
    },
    {
      templateType: 'challenge-complete' as const,
      name: 'Challenge Complete',
      subject: 'Congratulations! You completed {{challengeName}}',
      htmlContent: `
        <h1>Challenge Complete! 🎉</h1>
        <p>Great job {{username}}! You completed {{challengeName}} and earned {{xpEarned}} XP!</p>
      `,
      textContent: 'Congratulations {{username}}! You completed {{challengeName}}.',
      variables: ['username', 'challengeName', 'xpEarned'],
    },
  ];

  for (const template of defaultTemplates) {
    const existing = await EmailTemplate.findOne({
      templateType: template.templateType,
    });

    if (!existing) {
      await EmailTemplate.create(template);
    }
  }
};

export default {
  sendEmail,
  sendBulkEmail,
  createEmailTemplate,
  getEmailTemplate,
  getAllEmailTemplates,
  updateEmailTemplate,
  deleteEmailTemplate,
  getOrCreateEmailPreferences,
  updateEmailPreferences,
  unsubscribeFromAll,
  getEmailLogs,
  getEmailStats,
  trackEmailEvent,
  initializeDefaultTemplates,
};

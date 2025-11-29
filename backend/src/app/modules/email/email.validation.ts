import { z } from 'zod';

// Email Sending Schemas
export const sendEmailSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
    recipient: z.string().email(),
    templateType: z.enum([
      'welcome',
      'reset-password',
      'challenge-complete',
      'daily-reminder',
      'achievement-unlocked',
      'course-complete',
      'weekly-summary',
      'custom',
    ]),
    variables: z.record(z.any()).optional().default({}),
    scheduledAt: z.string().datetime().optional(),
  }),
});

export const sendBulkEmailSchema = z.object({
  body: z.object({
    recipients: z.array(
      z.object({
        userId: z.string(),
        email: z.string().email(),
        variables: z.record(z.any()).optional(),
      })
    ),
    templateType: z.enum([
      'welcome',
      'reset-password',
      'challenge-complete',
      'daily-reminder',
      'achievement-unlocked',
      'course-complete',
      'weekly-summary',
      'custom',
    ]),
    globalVariables: z.record(z.any()).optional(),
  }),
});

// Email Template Schemas
export const createEmailTemplateSchema = z.object({
  body: z.object({
    templateType: z.enum([
      'welcome',
      'reset-password',
      'challenge-complete',
      'daily-reminder',
      'achievement-unlocked',
      'course-complete',
      'weekly-summary',
      'custom',
    ]),
    name: z.string().min(1).max(200),
    subject: z.string().min(1).max(500),
    htmlContent: z.string().min(1),
    textContent: z.string().min(1),
    variables: z.array(z.string()).default([]),
  }),
});

export const updateEmailTemplateSchema = z.object({
  params: z.object({
    templateId: z.string(),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    subject: z.string().min(1).max(500).optional(),
    htmlContent: z.string().min(1).optional(),
    textContent: z.string().min(1).optional(),
    variables: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

// Email Preferences Schemas
export const updateEmailPreferencesSchema = z.object({
  body: z.object({
    dailyReminder: z.boolean().optional(),
    challengeComplete: z.boolean().optional(),
    achievementUnlocked: z.boolean().optional(),
    courseComplete: z.boolean().optional(),
    weeklySummary: z.boolean().optional(),
    friendActivity: z.boolean().optional(),
    marketplaceUpdates: z.boolean().optional(),
    systemAnnouncements: z.boolean().optional(),
  }),
});

// Email Logs Schemas
export const getEmailLogsSchema = z.object({
  query: z.object({
    userId: z.string().optional(),
    status: z.enum(['pending', 'sent', 'failed', 'bounced']).optional(),
    templateType: z.enum([
      'welcome',
      'reset-password',
      'challenge-complete',
      'daily-reminder',
      'achievement-unlocked',
      'course-complete',
      'weekly-summary',
      'custom',
    ]).optional(),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('20'),
    skip: z.string().transform(Number).pipe(z.number().min(0)).optional().default('0'),
  }),
});

export const trackEmailEventSchema = z.object({
  body: z.object({
    messageId: z.string(),
    event: z.enum(['open', 'click', 'bounce', 'spam']),
    timestamp: z.string().datetime().optional(),
  }),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>['body'];
export type SendBulkEmailInput = z.infer<typeof sendBulkEmailSchema>['body'];
export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>['body'];
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>['body'];
export type UpdateEmailPreferencesInput = z.infer<typeof updateEmailPreferencesSchema>['body'];
export type GetEmailLogsQuery = z.infer<typeof getEmailLogsSchema>['query'];

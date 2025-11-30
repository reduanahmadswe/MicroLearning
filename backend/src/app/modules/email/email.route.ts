import { Router } from 'express';
import { authGuard } from '../../../middleware/authGuard';
import { validateRequest } from '../../../middleware/validateRequest';
import emailController from './email.controller';
import * as emailValidation from './email.validation';

const router = Router();

// ==================== Email Sending Routes ====================

// Send single email
router.post(
  '/send',
  authGuard(),
  validateRequest(emailValidation.sendEmailSchema),
  emailController.sendEmail
);

// Send bulk email
router.post(
  '/send-bulk',
  authGuard(),
  validateRequest(emailValidation.sendBulkEmailSchema),
  emailController.sendBulkEmail
);

// ==================== Email Template Routes ====================

// Get all email templates
router.get(
  '/templates',
  authGuard(),
  emailController.getAllEmailTemplates
);

// Get email template by ID
router.get(
  '/templates/:templateId',
  authGuard(),
  emailController.getEmailTemplate
);

// Create email template (admin only)
router.post(
  '/templates',
  authGuard(),
  validateRequest(emailValidation.createEmailTemplateSchema),
  emailController.createEmailTemplate
);

// Update email template (admin only)
router.patch(
  '/templates/:templateId',
  authGuard(),
  validateRequest(emailValidation.updateEmailTemplateSchema),
  emailController.updateEmailTemplate
);

// Delete email template (admin only)
router.delete(
  '/templates/:templateId',
  authGuard(),
  emailController.deleteEmailTemplate
);

// ==================== Email Preference Routes ====================

// Get my email preferences
router.get(
  '/preferences/me',
  authGuard(),
  emailController.getMyEmailPreferences
);

// Update my email preferences
router.patch(
  '/preferences/me',
  authGuard(),
  validateRequest(emailValidation.updateEmailPreferencesSchema),
  emailController.updateMyEmailPreferences
);

// Unsubscribe from all emails
router.post(
  '/preferences/unsubscribe',
  authGuard(),
  emailController.unsubscribeFromAll
);

// ==================== Email Log Routes ====================

// Get email logs
router.get(
  '/logs',
  authGuard(),
  validateRequest(emailValidation.getEmailLogsSchema),
  emailController.getEmailLogs
);

// Get email stats
router.get(
  '/stats',
  authGuard(),
  emailController.getEmailStats
);

// Track email event (webhook for SendGrid/other providers)
router.post(
  '/track',
  validateRequest(emailValidation.trackEmailEventSchema),
  emailController.trackEmailEvent
);

// ==================== Testing Routes ====================

// Send test email (no auth required for testing)
router.post(
  '/test',
  emailController.sendTestEmail
);

// ==================== Admin Routes ====================

// Initialize default templates (admin only)
router.post(
  '/admin/initialize-templates',
  authGuard(),
  emailController.initializeTemplates
);

export default router;

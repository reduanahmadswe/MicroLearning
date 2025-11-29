import { Router } from 'express';
import certificateController from './certificate.controller';
import { validateRequest } from '../../../middleware/validateRequest';
import { generateCertificateValidation } from './certificate.validation';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// Public routes
router.get('/view/:certificateId', certificateController.getCertificateById);
router.get('/verify/:code', certificateController.verifyCertificate);

// Protected routes
router.post(
  '/generate',
  authGuard(),
  validateRequest(generateCertificateValidation),
  certificateController.generateCertificate
);

router.get('/me', authGuard(), certificateController.getMyCertificates);
router.get('/stats', authGuard(), certificateController.getCertificateStats);

// Admin routes
router.delete(
  '/:certificateId/revoke',
  authGuard('admin'),
  certificateController.revokeCertificate
);

export default router;

import express from 'express';
import { UploadController } from './upload.controller';
import authGuard from '../../../middleware/authGuard';
import validateRequest from '../../../middleware/validateRequest';
import { getUploadUrlSchema, deleteFileSchema } from './upload.validation';

const router = express.Router();

// All routes require authentication
router.use(authGuard());

// Get pre-signed upload URL
router.post('/url', validateRequest(getUploadUrlSchema), UploadController.getUploadUrl);

// Get user's uploaded files
router.get('/me', UploadController.getUserFiles);

// Get upload statistics
router.get('/stats', UploadController.getUploadStats);

// Get file by ID
router.get('/:fileId', UploadController.getFileById);

// Make file public
router.patch('/:fileId/public', UploadController.makeFilePublic);

// Delete file
router.delete('/:fileId', validateRequest(deleteFileSchema), UploadController.deleteFile);

export const UploadRoutes = router;

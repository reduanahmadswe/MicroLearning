import express from 'express';
import { validateRequest } from '../../../middleware/validateRequest';
import { authGuard } from '../../../middleware/authGuard';
import * as ASRController from './asr.controller';
import * as ASRValidation from './asr.validation';

const router = express.Router();

// Transcribe audio
router.post(
  '/transcribe',
  authGuard(),
  validateRequest(ASRValidation.transcribeAudioSchema),
  ASRController.transcribeAudio
);

// Translate audio to English
router.post(
  '/translate',
  authGuard(),
  validateRequest(ASRValidation.translateAudioSchema),
  ASRController.translateAudio
);

// Get transcription history
router.get(
  '/history',
  authGuard(),
  validateRequest(ASRValidation.getHistorySchema),
  ASRController.getTranscriptionHistory
);

// Get transcription by ID
router.get(
  '/history/:transcriptionId',
  authGuard(),
  validateRequest(ASRValidation.getTranscriptionSchema),
  ASRController.getTranscriptionById
);

// Delete transcription
router.delete(
  '/history/:transcriptionId',
  authGuard(),
  validateRequest(ASRValidation.deleteTranscriptionSchema),
  ASRController.deleteTranscription
);

// Get statistics
router.get(
  '/stats',
  authGuard(),
  ASRController.getASRStats
);

export default router;

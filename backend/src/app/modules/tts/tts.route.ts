import express from 'express';
import { validateRequest } from '../../../middleware/validateRequest';
import { authGuard } from '../../../middleware/authGuard';
import * as TTSController from './tts.controller';
import * as TTSValidation from './tts.validation';

const router = express.Router();

// Generate speech
router.post(
  '/generate',
  authGuard(),
  validateRequest(TTSValidation.generateSpeechSchema),
  TTSController.generateSpeech
);

// Batch generate speech
router.post(
  '/batch-generate',
  authGuard(),
  TTSController.batchGenerateSpeech
);

// Get TTS library
router.get(
  '/library',
  authGuard(),
  validateRequest(TTSValidation.getLibrarySchema),
  TTSController.getTTSLibrary
);

// Get audio by ID
router.get(
  '/library/:audioId',
  authGuard(),
  validateRequest(TTSValidation.playAudioSchema),
  TTSController.getAudioById
);

// Delete audio
router.delete(
  '/library/:audioId',
  authGuard(),
  validateRequest(TTSValidation.deleteAudioSchema),
  TTSController.deleteAudio
);

// Get statistics
router.get(
  '/stats',
  authGuard(),
  TTSController.getTTSStats
);

// Get voice previews
router.get(
  '/voices',
  validateRequest(TTSValidation.getVoicePreviewsSchema),
  TTSController.getVoicePreviews
);

export default router;

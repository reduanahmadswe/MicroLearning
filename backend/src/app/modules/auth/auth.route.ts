import { Router } from 'express';
import authController from './auth.controller';
import { validateRequest } from '../../../middleware/validateRequest';
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  googleLoginValidation,
} from './auth.validation';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerValidation), authController.register);
router.post('/login', validateRequest(loginValidation), authController.login);
router.post('/google-login', validateRequest(googleLoginValidation), authController.googleLogin);
router.post(
  '/refresh-token',
  validateRequest(refreshTokenValidation),
  authController.refreshToken
);

// Protected routes
router.post('/logout', authGuard(), authController.logout);
router.get('/me', authGuard(), authController.getMe);

export default router;

import { Router } from 'express';
import authController from './auth.controller';
import { validateRequest } from '../../../middleware/validateRequest';
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
} from './auth.validation';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerValidation), authController.register);
router.post('/login', validateRequest(loginValidation), authController.login);
router.post(
  '/refresh-token',
  validateRequest(refreshTokenValidation),
  authController.refreshToken
);

// Protected routes
router.post('/logout', authGuard(), authController.logout);

export default router;

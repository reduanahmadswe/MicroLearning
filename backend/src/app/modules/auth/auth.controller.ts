import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import authService from './auth.service';

class AuthController {
  // Register new user
  register = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  });

  // Login user
  login = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  // Google Login
  googleLogin = catchAsync(async (req: Request, res: Response) => {
    const { idToken } = req.body;
    const result = await authService.loginWithGoogle(idToken);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Google login successful',
      data: result,
    });
  });

  // Refresh access token
  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Access token refreshed successfully',
      data: result,
    });
  });

  // Logout user
  logout = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;
    await authService.logout(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Logout successful',
    });
  });

  // Get current user
  getMe = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;
    const result = await authService.getMe(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User retrieved successfully',
      data: result,
    });
  });
}

export default new AuthController();

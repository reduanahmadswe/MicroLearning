import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { IJwtPayload } from '../app/modules/auth/auth.types';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}

export const authGuard = (...allowedRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized - No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new ApiError(500, 'JWT access secret is not configured');
    }

    try {
      const decoded = jwt.verify(token, secret) as IJwtPayload;

      // Check if user role is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        throw new ApiError(403, 'Forbidden - Insufficient permissions');
      }

      // Attach user to request
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, 'Unauthorized - Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, 'Unauthorized - Token expired');
      }
      throw error;
    }
  });
};

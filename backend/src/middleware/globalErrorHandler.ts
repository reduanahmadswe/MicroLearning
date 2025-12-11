import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

interface IErrorResponse {
  statusCode: number;
  success: false;
  message: string;
  errorDetails?: any;
  stack?: string;
}

const globalErrorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let errorDetails = null;

  // Only log non-operational errors (like 500s) or critical issues
  // Skip logging 404s and 400s to avoid console noise for expected client errors (e.g. "Not enrolled")
  if (statusCode >= 500) {
    console.log('Global Error Handler:', error);
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = Object.values(error.errors).map((err: any) => ({
      path: err.path,
      message: err.message,
    }));
  }

  // Handle Mongoose duplicate key errors
  if (error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate Entry';
    const field = Object.keys(error.keyPattern)[0];
    errorDetails = {
      field,
      message: `${field} already exists`,
    };
  }

  // Handle Mongoose cast errors
  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    errorDetails = {
      path: error.path,
      value: error.value,
    };
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  const response: IErrorResponse = {
    statusCode,
    success: false,
    message,
    errorDetails,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export default globalErrorHandler;

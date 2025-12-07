import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import catchAsync from '../utils/catchAsync';

export const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log('🔍 [Validation] Incoming request:', {
      body: req.body,
      query: req.query,
      params: req.params,
    });

    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      console.log('✅ [Validation] Request validated successfully');
      next();
    } catch (error: any) {
      console.error('❌ [Validation] Failed:', {
        errors: error.errors || error.message,
        received: { body: req.body, query: req.query, params: req.params },
      });
      throw error;
    }
  });
};

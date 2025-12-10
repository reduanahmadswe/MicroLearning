import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import catchAsync from '../utils/catchAsync';

export const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {

    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
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

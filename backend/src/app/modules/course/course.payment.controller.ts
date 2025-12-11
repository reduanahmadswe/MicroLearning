import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import * as coursePaymentService from './course.payment.service';

/**
 * Initiate course payment
 */
export const initiateCoursePayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;
  const { courseId } = req.body;

  const result = await coursePaymentService.initiateCoursePayment(userId, courseId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment initiated successfully',
    data: result,
  });
});

/**
 * Payment success callback from SSLCommerz
 */
export const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
  const paymentData = req.body;
  
  const result = await coursePaymentService.handlePaymentSuccess(paymentData);

  // Redirect to frontend success page
  const frontendUrl = process.env.FRONTEND_URL || 'https://microlearning-beta.vercel.app';
  const courseId = result.enrollment?.course || result.payment?.course;
  res.redirect(`${frontendUrl}/courses/payment/success?courseId=${courseId}`);
});

/**
 * Payment fail callback from SSLCommerz
 */
export const paymentFail = catchAsync(async (req: Request, res: Response) => {
  const paymentData = req.body;
  
  await coursePaymentService.handlePaymentFail(paymentData);

  // Redirect to frontend fail page
  const frontendUrl = process.env.FRONTEND_URL || 'https://microlearning-beta.vercel.app/';
  res.redirect(`${frontendUrl}/courses/payment/fail`);
});

/**
 * Payment cancel callback from SSLCommerz
 */
export const paymentCancel = catchAsync(async (req: Request, res: Response) => {
  const paymentData = req.body;
  
  await coursePaymentService.handlePaymentCancel(paymentData);

  // Redirect to frontend cancel page
  const frontendUrl = process.env.FRONTEND_URL || 'https://microlearning-beta.vercel.app/';
  res.redirect(`${frontendUrl}/courses/payment/cancel`);
});

/**
 * IPN (Instant Payment Notification) from SSLCommerz
 */
export const paymentIPN = catchAsync(async (req: Request, res: Response) => {
  const paymentData = req.body;
  
  // Process IPN data (same as success for validation)
  await coursePaymentService.handlePaymentSuccess(paymentData);

  res.status(200).send('IPN received');
});

/**
 * Get user's course payment history
 */
export const getUserPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;
  
  const payments = await coursePaymentService.getUserCoursePayments(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment history retrieved successfully',
    data: payments,
  });
});

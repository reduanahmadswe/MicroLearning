import { Course, CoursePayment, Enrollment } from './course.model';
import User from '../auth/auth.model';
import ApiError from '../../../utils/ApiError';
import httpStatus from 'http-status';
import SSLCommerzPayment from 'sslcommerz-lts';

/**
 * Initiate Course Payment with SSLCommerz
 */
export const initiateCoursePayment = async (userId: string, courseId: string) => {
  // Get course details
  const course = await Course.findById(courseId).populate('author', 'name');
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  if (!course.isPublished) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Course is not published');
  }

  // Check if course is premium
  if (!course.isPremium || !course.price || course.price <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This course is free. No payment required.');
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
  if (existingEnrollment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are already enrolled in this course');
  }

  // Check if payment already exists and is completed
  const existingPayment = await CoursePayment.findOne({
    user: userId,
    course: courseId,
    paymentStatus: 'completed',
  });
  if (existingPayment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You have already purchased this course');
  }

  // Get user details
  const user = await User.findById(userId).select('name email phone');
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Create payment record
  const payment = await CoursePayment.create({
    user: userId,
    course: courseId,
    amount: course.price,
    currency: 'BDT',
    paymentStatus: 'pending',
    paymentMethod: 'sslcommerz',
  });

  // Initialize SSLCommerz
  const store_id = process.env.SSLCOMMERZ_STORE_ID || '';
  const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || '';
  const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';

  console.log('🔧 SSLCommerz Config:', {
    store_id: store_id ? `${store_id.substring(0, 10)}...` : 'MISSING',
    has_password: !!store_passwd,
    is_live,
    backend_url: process.env.BACKEND_URL,
  });

  if (!store_id || !store_passwd) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'SSLCommerz credentials not configured');
  }

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  // Prepare payment data
  const paymentData = {
    total_amount: course.price,
    currency: 'BDT',
    tran_id: payment._id.toString(), // Unique transaction ID
    success_url: `${process.env.BACKEND_URL}/api/v1/courses/payment/success`,
    fail_url: `${process.env.BACKEND_URL}/api/v1/courses/payment/fail`,
    cancel_url: `${process.env.BACKEND_URL}/api/v1/courses/payment/cancel`,
    ipn_url: `${process.env.BACKEND_URL}/api/v1/courses/payment/ipn`,
    
    product_name: course.title.substring(0, 100), // Max 100 chars
    product_category: (course.topic || 'Course').substring(0, 50),
    product_profile: 'digital-goods',
    
    cus_name: user.name.substring(0, 50),
    cus_email: user.email,
    cus_phone: user.phone || '01700000000',
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    
    shipping_method: 'NO',
    num_of_item: 1,
    
    // Custom fields to track our data
    value_a: userId, // User ID
    value_b: courseId, // Course ID
    value_c: payment._id.toString(), // Payment ID
  };

  console.log('💳 Payment Data:', {
    ...paymentData,
    cus_phone: paymentData.cus_phone,
    total_amount: paymentData.total_amount,
  });

  try {
    const apiResponse = await sslcz.init(paymentData);
    
    console.log('✅ SSLCommerz Response:', apiResponse);
    
    if (apiResponse.status === 'SUCCESS') {
      // Update payment with session ID
      payment.sslSessionId = apiResponse.sessionkey;
      await payment.save();
      
      return {
        paymentUrl: apiResponse.GatewayPageURL,
        paymentId: payment._id,
        sessionId: apiResponse.sessionkey,
      };
    } else {
      console.error('❌ SSLCommerz failed:', apiResponse);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Payment initialization failed: ${apiResponse.failedreason || 'Unknown error'}`);
    }
  } catch (error: any) {
    console.error('❌ SSLCommerz Error:', error.message || error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR, 
      `Payment initialization failed: ${error.message || 'SSLCommerz API error'}`
    );
  }
};

/**
 * Handle Payment Success
 */
export const handlePaymentSuccess = async (paymentData: any) => {
  const { tran_id, val_id, amount, card_type, card_brand, bank_tran_id } = paymentData;

  // Find payment record
  const payment = await CoursePayment.findById(tran_id);
  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment record not found');
  }

  // Validate payment with SSLCommerz
  const store_id = process.env.SSLCOMMERZ_STORE_ID || '';
  const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || '';
  const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';
  
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  try {
    const validation = await sslcz.validate({ val_id });

    if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
      // Update payment status
      payment.paymentStatus = 'completed';
      payment.transactionId = val_id;
      payment.bankTransactionId = bank_tran_id;
      payment.cardType = card_type;
      payment.cardBrand = card_brand;
      payment.paymentCompletedAt = new Date();
      await payment.save();

      // Create enrollment
      const enrollment = await Enrollment.create({
        user: payment.user,
        course: payment.course,
      });

      // Increment course enrolled count
      await Course.findByIdAndUpdate(payment.course, {
        $inc: { enrolledCount: 1 },
      });

      console.log('✅ Payment successful! Course enrolled:', enrollment._id);

      return {
        success: true,
        enrollment,
        payment,
      };
    } else {
      throw new Error('Payment validation failed');
    }
  } catch (error: any) {
    console.error('Payment validation error:', error);
    payment.paymentStatus = 'failed';
    await payment.save();
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment verification failed');
  }
};

/**
 * Handle Payment Failure
 */
export const handlePaymentFail = async (paymentData: any) => {
  const { tran_id } = paymentData;

  const payment = await CoursePayment.findById(tran_id);
  if (payment) {
    payment.paymentStatus = 'failed';
    await payment.save();
  }

  return { success: false, message: 'Payment failed' };
};

/**
 * Handle Payment Cancel
 */
export const handlePaymentCancel = async (paymentData: any) => {
  const { tran_id } = paymentData;

  const payment = await CoursePayment.findById(tran_id);
  if (payment) {
    payment.paymentStatus = 'failed';
    await payment.save();
  }

  return { success: false, message: 'Payment cancelled' };
};

/**
 * Get User's Payment History for Courses
 */
export const getUserCoursePayments = async (userId: string) => {
  const payments = await CoursePayment.find({ user: userId })
    .populate('course', 'title thumbnail price topic')
    .sort({ createdAt: -1 })
    .lean();

  return payments;
};

/**
 * Check if user has purchased a course
 */
export const hasUserPurchasedCourse = async (userId: string, courseId: string) => {
  const payment = await CoursePayment.findOne({
    user: userId,
    course: courseId,
    paymentStatus: 'completed',
  });

  return !!payment;
};

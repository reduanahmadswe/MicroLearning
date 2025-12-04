import { Job } from 'bull';
import { paymentProcessingQueue, enrollmentQueue } from '../config/queue';
import { CoursePayment, Course, Enrollment } from '../app/modules/course/course.model';
import SSLCommerzPayment from 'sslcommerz-lts';

interface PaymentValidationJob {
  paymentId: string;
  transactionId: string;
  validationData: any;
}

interface EnrollmentJob {
  userId: string;
  courseId: string;
  paymentId: string;
}

/**
 * Process payment validation in background queue
 * This ensures payment validation continues even if request times out
 */
paymentProcessingQueue.process('validate-payment', async (job: Job<PaymentValidationJob>) => {
  const { paymentId, transactionId, validationData } = job.data;
  
  console.log(`🔄 Processing payment validation for payment: ${paymentId}`);
  
  try {
    // Find payment record
    const payment = await CoursePayment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment record not found');
    }

    // Skip if already processed
    if (payment.paymentStatus === 'completed') {
      console.log(`⏭️ Payment ${paymentId} already completed, skipping`);
      return { success: true, message: 'Already processed' };
    }

    // Validate with SSLCommerz
    const store_id = process.env.SSLCOMMERZ_STORE_ID || '';
    const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || '';
    const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';
    
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validation = await sslcz.validate({ val_id: transactionId });

    if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
      // Update payment status
      payment.paymentStatus = 'completed';
      payment.transactionId = transactionId;
      payment.bankTransactionId = validationData.bank_tran_id;
      payment.cardType = validationData.card_type;
      payment.cardBrand = validationData.card_brand;
      payment.paymentCompletedAt = new Date();
      await payment.save();

      // Add enrollment job to queue
      await enrollmentQueue.add('create-enrollment', {
        userId: payment.user.toString(),
        courseId: payment.course.toString(),
        paymentId: payment._id.toString(),
      }, {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      console.log(`✅ Payment ${paymentId} validated successfully`);
      return { success: true, paymentId, enrollmentQueued: true };
    } else {
      throw new Error('Payment validation failed: ' + validation.status);
    }
  } catch (error: any) {
    console.error(`❌ Payment validation error for ${paymentId}:`, error.message);
    
    // Update payment status to failed after all retries
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      try {
        await CoursePayment.findByIdAndUpdate(paymentId, {
          paymentStatus: 'failed',
        });
      } catch (dbError) {
        console.error('Failed to update payment status:', dbError);
      }
    }
    
    throw error; // Re-throw to trigger retry
  }
});

/**
 * Process enrollment creation in background queue
 * Separate from payment validation for better fault tolerance
 */
enrollmentQueue.process('create-enrollment', async (job: Job<EnrollmentJob>) => {
  const { userId, courseId, paymentId } = job.data;
  
  console.log(`🔄 Creating enrollment for user ${userId}, course ${courseId}`);
  
  try {
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (existingEnrollment) {
      console.log(`⏭️ User ${userId} already enrolled in ${courseId}, skipping`);
      return { success: true, message: 'Already enrolled', enrollmentId: existingEnrollment._id };
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
    });

    // Increment course enrolled count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledCount: 1 },
    });

    console.log(`✅ Enrollment created: ${enrollment._id}`);
    return { success: true, enrollmentId: enrollment._id };
  } catch (error: any) {
    console.error(`❌ Enrollment creation error:`, error.message);
    throw error; // Re-throw to trigger retry
  }
});

console.log('🚀 Payment queue workers started');

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
paymentProcessingQueue.process(async (job: any) => {
  const { paymentId, transactionId, validationData } = job.data as PaymentValidationJob;


  try {
    // Find payment record
    const payment = await CoursePayment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment record not found');
    }

    // Skip if already processed
    if (payment.paymentStatus === 'completed') {
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
      await enrollmentQueue.add({
        userId: payment.user.toString(),
        courseId: payment.course.toString(),
        paymentId: payment._id.toString(),
      });

      return { success: true, paymentId, enrollmentQueued: true };
    } else {
      throw new Error('Payment validation failed: ' + validation.status);
    }
  } catch (error: any) {
    console.error(`❌ Payment validation error for ${paymentId}:`, error.message);

    // Update payment status to failed after all retries
    if (job.attempts >= 3) {
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
enrollmentQueue.process(async (job: any) => {
  const { userId, courseId } = job.data as EnrollmentJob;


  try {
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (existingEnrollment) {
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

    return { success: true, enrollmentId: enrollment._id };
  } catch (error: any) {
    console.error(`❌ Enrollment creation error:`, error.message);
    throw error; // Re-throw to trigger retry
  }
});


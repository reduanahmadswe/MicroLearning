import Queue from 'bull';


// Redis client configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times: number) => {
    if (times > 3) {
      console.warn('⚠️ Redis connection failed. Using in-memory queue fallback.');
      return null; // Stop retrying
    }
    return Math.min(times * 1000, 3000);
  },
};

// Create Bull queues with Redis (with fallback)
let paymentProcessingQueue: Queue.Queue;
let enrollmentQueue: Queue.Queue;

try {
  paymentProcessingQueue = new Queue('payment-processing', {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 5, // Retry 5 times if failed
      backoff: {
        type: 'exponential',
        delay: 2000, // Start with 2 seconds, then exponential backoff
      },
      removeOnComplete: false, // Keep completed jobs for 7 days
      removeOnFail: false, // Keep failed jobs for debugging
    },
  });

  enrollmentQueue = new Queue('enrollment-processing', {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  });

  console.log('📊 Payment and Enrollment Queues initialized with Redis');
} catch (error) {
  console.warn('⚠️ Redis not available, queues may not persist across restarts');

  // Fallback: Still create queues (Bull will work without Redis but won't persist)
  paymentProcessingQueue = new Queue('payment-processing', {
    redis: { host: 'localhost', port: 6379 },
  });

  enrollmentQueue = new Queue('enrollment-processing', {
    redis: { host: 'localhost', port: 6379 },
  });
}

export { paymentProcessingQueue, enrollmentQueue };

// Cleanup old jobs (older than 7 days)
const cleanupOldJobs = async () => {
  try {
    await paymentProcessingQueue.clean(7 * 24 * 60 * 60 * 1000, 'completed');
    await paymentProcessingQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed');
    await enrollmentQueue.clean(7 * 24 * 60 * 60 * 1000, 'completed');
    await enrollmentQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed');
  } catch (error) {
    console.error('Queue cleanup error:', error);
  }
};

// Run cleanup every 6 hours
setInterval(cleanupOldJobs, 6 * 60 * 60 * 1000);

// Log queue status
paymentProcessingQueue.on('completed', (job) => {
  console.log(`✅ Payment job ${job.id} completed`);
});

paymentProcessingQueue.on('failed', (job, err) => {
  console.error(`❌ Payment job ${job?.id} failed:`, err.message);
});

enrollmentQueue.on('completed', (job) => {
  console.log(`✅ Enrollment job ${job.id} completed`);
});

enrollmentQueue.on('failed', (job, err) => {
  console.error(`❌ Enrollment job ${job?.id} failed:`, err.message);
});

// Simple in-memory queue implementation (no Redis required)
interface QueueJob {
  id: string;
  data: any;
  attempts: number;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  error?: string;
}

class SimpleQueue {
  private jobs: Map<string, QueueJob> = new Map();
  private handlers: Map<string, Function> = new Map();
  private jobIdCounter = 0;

  constructor(private name: string) {
  }

  async add(data: any): Promise<QueueJob> {
    const job: QueueJob = {
      id: `${this.name}-${++this.jobIdCounter}`,
      data,
      attempts: 0,
      status: 'waiting',
    };

    this.jobs.set(job.id, job);

    // Process immediately in background
    setImmediate(() => this.processJob(job.id));

    return job;
  }

  process(handler: Function) {
    this.handlers.set('default', handler);
  }

  private async processJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const handler = this.handlers.get('default');
    if (!handler) return;

    job.status = 'active';
    job.attempts++;

    try {
      await handler(job);
      job.status = 'completed';
      this.emit('completed', job);

      // Clean up completed jobs after 1 hour
      setTimeout(() => this.jobs.delete(jobId), 60 * 60 * 1000);
    } catch (error: any) {
      job.status = 'failed';
      job.error = error.message;
      this.emit('failed', job, error);

      // Retry logic (max 3 attempts)
      if (job.attempts < 3) {
        job.status = 'waiting';
        setTimeout(() => this.processJob(jobId), 5000 * job.attempts);
      }
    }
  }

  on(event: string, callback: Function) {
    this.handlers.set(event, callback);
  }

  private emit(event: string, ...args: any[]) {
    const handler = this.handlers.get(event);
    if (handler) {
      handler(...args);
    }
  }

  async clean() {
    // Clean old jobs
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed') {
        this.jobs.delete(id);
      }
    }
  }
}

// Create simple in-memory queues
const paymentProcessingQueue = new SimpleQueue('payment-processing');
const enrollmentQueue = new SimpleQueue('enrollment-processing');

export { paymentProcessingQueue, enrollmentQueue };

// Cleanup old jobs every hour
setInterval(() => {
  paymentProcessingQueue.clean();
  enrollmentQueue.clean();
}, 60 * 60 * 1000);

// Log queue events
paymentProcessingQueue.on('completed', (_job: QueueJob) => {
});

paymentProcessingQueue.on('failed', (job: QueueJob, err: Error) => {
  console.error(`❌ Payment job ${job.id} failed:`, err.message);
});

enrollmentQueue.on('completed', (_job: QueueJob) => {
});

enrollmentQueue.on('failed', (job: QueueJob, err: Error) => {
  console.error(`❌ Enrollment job ${job.id} failed:`, err.message);
});

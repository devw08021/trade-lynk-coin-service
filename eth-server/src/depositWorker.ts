import { Worker, QueueEvents, Queue } from 'bullmq';
import { sendDepositEvent } from './kafka';
import { Counter, Registry, collectDefaultMetrics } from 'prom-client';
import express from 'express';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DEAD_LETTER_QUEUE = 'deposit-events-dlq';

// Prometheus metrics
const register = new Registry();
collectDefaultMetrics({ register });
const processedCounter = new Counter({ name: 'deposit_jobs_processed_total', help: 'Total deposit jobs processed', registers: [register] });
const failedCounter = new Counter({ name: 'deposit_jobs_failed_total', help: 'Total deposit jobs failed', registers: [register] });
const retriedCounter = new Counter({ name: 'deposit_jobs_retried_total', help: 'Total deposit jobs retried', registers: [register] });
const deadLetterCounter = new Counter({ name: 'deposit_jobs_dead_letter_total', help: 'Total deposit jobs sent to dead letter queue', registers: [register] });

// Dead letter queue
const deadLetterQueue = new Queue(DEAD_LETTER_QUEUE, { connection: { url: REDIS_URL } });

const worker = new Worker('deposit-events', async job => {
  try {
    await sendDepositEvent(job.data);
    processedCounter.inc();
  } catch (err) {
    failedCounter.inc();
    console.error('Failed to send deposit event to Kafka:', err);
    throw err; // Let BullMQ handle retries
  }
}, {
  connection: { url: REDIS_URL },
  // You can configure attempts, backoff, etc. here
  attempts: 5,
  backoff: { type: 'exponential', delay: 5000 },
});

const queueEvents = new QueueEvents('deposit-events', { connection: { url: REDIS_URL } });
queueEvents.on('failed', async ({ jobId, failedReason, prev }) => {
  failedCounter.inc();
  if (prev && prev.attemptsMade >= 5) {
    // Move to dead letter queue
    const job = await worker.getJob(jobId);
    if (job) {
      await deadLetterQueue.add('dead-letter', job.data);
      deadLetterCounter.inc();
      console.error(`Job ${jobId} moved to dead letter queue: ${failedReason}`);
    }
  } else {
    retriedCounter.inc();
  }
});

console.log('Deposit event worker started.');

// Expose Prometheus metrics endpoint
const app = express();
const METRICS_PORT = process.env.DEPOSIT_WORKER_METRICS_PORT || 4001;
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
app.listen(METRICS_PORT, () => {
  console.log(`Deposit worker metrics available at http://localhost:${METRICS_PORT}/metrics`);
}); 
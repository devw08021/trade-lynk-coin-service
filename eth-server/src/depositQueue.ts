import { Queue } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const DEPOSIT_DEAD_LETTER_QUEUE = 'deposit-events-dlq';

export const depositQueue = new Queue('deposit-events', {
  connection: { url: REDIS_URL },
}); 
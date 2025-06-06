import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import router from './routes';
import { connectProducer } from './kafka';
import { connectRedis } from './redisStore';
import { syncFromWalletService } from './walletServiceSync';
import { startBlockScanner } from './blockScanner';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { collectDefaultMetrics, Registry } from 'prom-client';

const app = express();
app.use(express.json());

// Logging
app.use(morgan('combined'));

// Metrics
const register = new Registry();
collectDefaultMetrics({ register });
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API Key Auth Middleware
const API_KEY = process.env.ETH_SERVER_API_KEY;
app.use((req, res, next) => {
  if (!API_KEY) return next(); // No auth if not set
  const key = req.header('x-api-key');
  if (key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

// Rate limiting for sensitive endpoints
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
});
app.use(['/user', '/contract', '/admin'], sensitiveLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/', router);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectRedis();
    await syncFromWalletService();
    await connectProducer();
    app.listen(PORT, () => {
      console.log(`eth-server listening on port ${PORT}`);
      startBlockScanner().then(() => console.log('Block scanner started.'));
    });
  } catch (err) {
    const msg = (err as Error).message;
    console.error('Failed to initialize service:', msg);
    process.exit(1);
  }
}

// To run the deposit event worker, use:
// bun run src/depositWorker.ts
// This should be run as a separate process for production reliability.

start(); 
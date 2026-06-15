import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

/**
 * Connect to MongoDB. Retries with backoff so a cold Atlas/free-tier DB or a
 * not-yet-ready local container doesn't crash the process on startup.
 */
export async function connectDb(uri = config.MONGODB_URI, { retries = 5, delayMs = 2000 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      logger.info('✅ MongoDB connected');
      return mongoose.connection;
    } catch (err) {
      logger.warn({ err: err.message, attempt, retries }, 'MongoDB connection failed, retrying…');
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
  return mongoose.connection;
}

export async function disconnectDb() {
  await mongoose.disconnect();
}

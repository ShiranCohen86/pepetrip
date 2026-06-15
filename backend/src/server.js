import { createApp } from './app.js';
import { config } from './config/env.js';
import { connectDb } from './config/db.js';
import { logger } from './config/logger.js';

async function start() {
  await connectDb();

  if (!config.GOOGLE_CLIENT_ID) {
    logger.warn('GOOGLE_CLIENT_ID is not set — Google sign-in will be unavailable.');
  }
  if (!config.GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY is not set — AI itinerary generation will be unavailable.');
  }

  const app = createApp();
  const server = app.listen(config.PORT, () =>
    logger.info(`🚀 API listening on http://localhost:${config.PORT} (${config.NODE_ENV})`),
  );

  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});

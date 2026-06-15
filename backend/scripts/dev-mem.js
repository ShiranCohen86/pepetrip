/**
 * Run the full backend (which also serves the built SPA) against an in-memory
 * MongoDB — zero external setup, no Docker. Great for trying the app locally.
 *
 *   npm run dev:mem      (from repo root)
 *
 * Note: Google sign-in still needs a real GOOGLE_CLIENT_ID, and AI needs a
 * GEMINI_API_KEY. The one-click "Try the demo" button works without either
 * (ALLOW_DEV_LOGIN is enabled below) so you can explore every screen.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = await MongoMemoryServer.create();

process.env.MONGODB_URI = mongod.getUri('pepetrip');
process.env.NODE_ENV ??= 'development';
process.env.PORT ??= '4000';
process.env.JWT_ACCESS_SECRET ??= 'dev_access_secret_dev_access_secret_min16';
process.env.JWT_REFRESH_SECRET ??= 'dev_refresh_secret_dev_refresh_secret_min16';
process.env.COOKIE_SECURE ??= 'false';
process.env.ALLOW_DEV_LOGIN ??= 'true'; // enables the one-click demo login in dev

// eslint-disable-next-line no-console
console.log(`🧪 In-memory MongoDB ready at ${process.env.MONGODB_URI}`);

// Import after env is set so config validation + DB connect use these values.
await import('../src/server.js');

const stop = async () => {
  await mongod.stop();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

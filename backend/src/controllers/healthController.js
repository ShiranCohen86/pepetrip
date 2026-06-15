import mongoose from 'mongoose';
import { sendData } from '../helpers/response.js';
import { config } from '../config/env.js';

/** Liveness/readiness probe (used by Render's healthCheckPath). */
export function health(_req, res) {
  const connected = mongoose.connection.readyState === 1;
  sendData(res, {
    status: 'ok',
    db: connected ? 'up' : 'down',
    uptime: Math.round(process.uptime()),
    env: config.NODE_ENV,
  });
}

/** Public, non-secret runtime config the SPA needs before rendering (e.g. Google client id). */
export function publicConfig(_req, res) {
  sendData(res, {
    googleClientId: config.GOOGLE_CLIENT_ID,
    aiEnabled: Boolean(config.GEMINI_API_KEY),
    devLogin: config.ALLOW_DEV_LOGIN && !config.isProd,
  });
}

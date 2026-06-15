import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import pinoHttp from 'pino-http';
import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { apiLimiter } from './middlewares/rateLimit.js';
import { apiRouter } from './routes/index.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { mountSpa } from './middlewares/serveSpa.js';
import { storage } from './services/storage/index.js';

/** Content Security Policy that permits Google Identity Services + remote avatars/images. */
const prodCsp = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      'https://accounts.google.com/gsi/client',
      // Hash of the inline locale/RTL bootstrap in index.html (sets <html dir>
      // before React mounts, avoiding an LTR flash for Hebrew). Update this if
      // that inline script's content changes, or the browser will block it.
      "'sha256-xVkVtIZ7ow5SrVHI/zBtGGkE66IINiwIm/8IB0fiNOg='",
    ],
    connectSrc: [
      "'self'",
      'https://accounts.google.com/gsi/',
      'https://res.cloudinary.com',
      // Open-Meteo geocoding (TripMap place lookup) + forecast, called client-side.
      'https://geocoding-api.open-meteo.com',
      'https://api.open-meteo.com',
    ],
    frameSrc: ["'self'", 'https://accounts.google.com/gsi/'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com/gsi/style'],
    imgSrc: ["'self'", 'data:', 'https:'],
    fontSrc: ["'self'", 'data:'],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
  },
};

export function createApp() {
  const app = express();
  // Trust the platform proxy (Render) so req.ip and Secure cookies work correctly.
  app.set('trust proxy', 1);

  app.use(pinoHttp({ logger, autoLogging: !config.isTest }));
  app.use(
    helmet({
      contentSecurityPolicy: config.isProd ? prodCsp : false,
      // Google Identity Services signs in via a popup; helmet's default COOP
      // (same-origin) severs window.opener so the popup can't post the credential
      // back to the page — it just hangs blank. Allow popups to keep the opener.
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
  );
  // CORS is only relevant in dev (cross-origin Vite). In prod the app is same-origin.
  app.use(
    cors({
      origin: config.corsOrigins.length ? config.corsOrigins : false,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(compression());

  app.use('/api/v1', apiLimiter, apiRouter);
  app.use('/api', notFound); // unmatched /api/* -> JSON 404

  // Serve locally-stored uploads (photos/documents) when using the local driver.
  if (storage.driver === 'local') {
    app.use('/uploads', express.static(storage.uploadsDir));
  }

  mountSpa(app); // production: serve built SPA + fallback

  app.use(errorHandler);
  return app;
}

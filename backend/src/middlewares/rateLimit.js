import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

const make = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    // Disabled under test so suites aren't throttled.
    skip: () => config.isTest,
    message: { data: null, error: { code: 'RATE_LIMITED', message }, meta: null },
  });

/** Broad limiter applied to the whole /api surface. */
export const apiLimiter = make(15 * 60 * 1000, 600, 'Too many requests, slow down.');

/** Tighter limiter for auth endpoints (login / refresh). */
export const authLimiter = make(15 * 60 * 1000, 40, 'Too many auth attempts, try again later.');

/** Strict limiter for the expensive AI generation endpoint (protects the free quota). */
export const aiLimiter = make(60 * 60 * 1000, 30, 'AI generation limit reached, try again later.');

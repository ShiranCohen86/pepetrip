import { Router } from 'express';
import { googleAuthSchema, updatePreferencesSchema } from '@pepetrip/shared';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import * as authController from '../controllers/authController.js';

export const authRouter = Router();

authRouter.post(
  '/google',
  authLimiter,
  validate({ body: googleAuthSchema }),
  authController.googleLogin,
);
authRouter.post('/dev-login', authLimiter, authController.devLogin);
authRouter.post('/refresh', authLimiter, authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.me);
authRouter.patch(
  '/preferences',
  requireAuth,
  validate({ body: updatePreferencesSchema }),
  authController.updatePreferences,
);

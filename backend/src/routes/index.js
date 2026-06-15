import { Router } from 'express';
import { health, publicConfig } from '../controllers/healthController.js';
import { authRouter } from './authRoutes.js';
import { tripRouter } from './tripRoutes.js';
import { statsRouter } from './statsRoutes.js';
import { integrationsRouter } from './integrationsRoutes.js';
import { adminRouter } from './adminRoutes.js';

export const apiRouter = Router();

apiRouter.get('/health', health);
apiRouter.get('/config', publicConfig);
apiRouter.use('/auth', authRouter);
apiRouter.use('/trips', tripRouter);
apiRouter.use('/stats', statsRouter);
apiRouter.use('/integrations', integrationsRouter);
apiRouter.use('/admin', adminRouter);

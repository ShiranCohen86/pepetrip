import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.js';
import * as integrationsController from '../controllers/integrationsController.js';

export const integrationsRouter = Router();
integrationsRouter.use(requireAuth);

integrationsRouter.get('/', integrationsController.list);
integrationsRouter.post(
  '/:key/sync',
  validate({ params: z.object({ key: z.string().max(40) }) }),
  integrationsController.sync,
);

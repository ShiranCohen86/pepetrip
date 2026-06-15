import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import * as statsController from '../controllers/statsController.js';

export const statsRouter = Router();
statsRouter.use(requireAuth);

statsRouter.get('/', statsController.get);
statsRouter.get('/achievements', statsController.achievements);

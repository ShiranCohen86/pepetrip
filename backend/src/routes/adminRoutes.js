import { Router } from 'express';
import { paginationQuerySchema } from '@pepetrip/shared';
import { validate } from '../middlewares/validate.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import * as adminController from '../controllers/adminController.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.get('/overview', adminController.overview);
adminRouter.get('/users', validate({ query: paginationQuerySchema }), adminController.users);

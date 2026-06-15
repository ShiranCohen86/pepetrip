import { Router } from 'express';
import * as tripController from '../controllers/tripController.js';

// Public, unauthenticated read access to a trip via its share token.
export const shareRouter = Router();

shareRouter.get('/:token', tripController.getShared);

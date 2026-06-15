import { Router } from 'express';
import { z } from 'zod';
import {
  createTripSchema,
  updateTripSchema,
  listTripsQuerySchema,
  paginationQuerySchema,
  objectIdSchema,
  activityInputSchema,
  activityUpdateSchema,
  reorderItinerarySchema,
} from '@pepetrip/shared';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.js';
import { aiLimiter } from '../middlewares/rateLimit.js';
import * as tripController from '../controllers/tripController.js';
import * as weatherController from '../controllers/weatherController.js';
import * as packingController from '../controllers/packingController.js';
import { expenseRouter } from './expenseRoutes.js';
import { photoRouter } from './photoRoutes.js';
import { documentRouter } from './documentRoutes.js';
import { packingItemInputSchema, packingItemPatchSchema, addMemberSchema } from '@pepetrip/shared';

export const tripRouter = Router();
tripRouter.use(requireAuth);

const idParams = z.object({ id: objectIdSchema });
const dayParams = z.object({ id: objectIdSchema, dayId: objectIdSchema });
const activityParams = z.object({
  id: objectIdSchema,
  dayId: objectIdSchema,
  activityId: objectIdSchema,
});
const listQuery = paginationQuerySchema.merge(listTripsQuerySchema);

tripRouter.get('/', validate({ query: listQuery }), tripController.list);
tripRouter.post('/', validate({ body: createTripSchema }), tripController.create);
tripRouter.get('/:id', validate({ params: idParams }), tripController.get);
tripRouter.patch(
  '/:id',
  validate({ params: idParams, body: updateTripSchema }),
  tripController.update,
);
tripRouter.delete('/:id', validate({ params: idParams }), tripController.remove);

// Public read-only sharing (owner-managed). The public GET lives on shareRoutes.
tripRouter.post('/:id/share', validate({ params: idParams }), tripController.share);
tripRouter.delete('/:id/share', validate({ params: idParams }), tripController.unshare);

tripRouter.post(
  '/:id/generate',
  aiLimiter,
  validate({ params: idParams }),
  tripController.generate,
);
tripRouter.patch(
  '/:id/reorder',
  validate({ params: idParams, body: reorderItinerarySchema }),
  tripController.reorder,
);

tripRouter.post(
  '/:id/days/:dayId/activities',
  validate({ params: dayParams, body: activityInputSchema }),
  tripController.addActivity,
);
tripRouter.patch(
  '/:id/days/:dayId/activities/:activityId',
  validate({ params: activityParams, body: activityUpdateSchema }),
  tripController.updateActivity,
);
tripRouter.delete(
  '/:id/days/:dayId/activities/:activityId',
  validate({ params: activityParams }),
  tripController.deleteActivity,
);

/* ───────────── Phase 2: weather, expenses, packing ───────────── */

tripRouter.get('/:id/weather', validate({ params: idParams }), weatherController.tripWeather);

tripRouter.use('/:id/expenses', expenseRouter);
tripRouter.use('/:id/photos', photoRouter);
tripRouter.use('/:id/documents', documentRouter);

const packingItemParams = z.object({ id: objectIdSchema, itemId: objectIdSchema });
tripRouter.get('/:id/packing', validate({ params: idParams }), packingController.get);
tripRouter.post(
  '/:id/packing/generate',
  aiLimiter,
  validate({ params: idParams }),
  packingController.generate,
);
tripRouter.post(
  '/:id/packing/items',
  validate({ params: idParams, body: packingItemInputSchema }),
  packingController.addItem,
);
tripRouter.patch(
  '/:id/packing/items/:itemId',
  validate({ params: packingItemParams, body: packingItemPatchSchema }),
  packingController.updateItem,
);
tripRouter.delete(
  '/:id/packing/items/:itemId',
  validate({ params: packingItemParams }),
  packingController.deleteItem,
);

/* ───────────── Phase 5: group travel (members) ───────────── */

const memberParams = z.object({ id: objectIdSchema, memberId: objectIdSchema });
tripRouter.post(
  '/:id/members',
  validate({ params: idParams, body: addMemberSchema }),
  tripController.addMember,
);
tripRouter.delete(
  '/:id/members/:memberId',
  validate({ params: memberParams }),
  tripController.removeMember,
);

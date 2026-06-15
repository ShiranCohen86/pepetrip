import { Router } from 'express';
import { z } from 'zod';
import { photoMetaSchema, objectIdSchema } from '@pepetrip/shared';
import { validate } from '../middlewares/validate.js';
import { upload, requireFile } from '../middlewares/upload.js';
import * as photoController from '../controllers/photoController.js';

/** Mounted at /trips/:id/photos (mergeParams keeps the trip :id). */
export const photoRouter = Router({ mergeParams: true });

const tripParams = z.object({ id: objectIdSchema });
const photoParams = z.object({ id: objectIdSchema, photoId: objectIdSchema });

photoRouter.get('/', validate({ params: tripParams }), photoController.list);
photoRouter.post(
  '/',
  upload.single('file'),
  requireFile,
  validate({ params: tripParams, body: photoMetaSchema }),
  photoController.create,
);
photoRouter.delete('/:photoId', validate({ params: photoParams }), photoController.remove);

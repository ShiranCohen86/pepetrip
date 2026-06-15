import { Router } from 'express';
import { z } from 'zod';
import { documentMetaSchema, ocrExtractSchema, objectIdSchema } from '@pepetrip/shared';
import { validate } from '../middlewares/validate.js';
import { upload, requireFile } from '../middlewares/upload.js';
import * as documentController from '../controllers/documentController.js';

/** Mounted at /trips/:id/documents (mergeParams keeps the trip :id). */
export const documentRouter = Router({ mergeParams: true });

const tripParams = z.object({ id: objectIdSchema });
const docParams = z.object({ id: objectIdSchema, docId: objectIdSchema });

documentRouter.get('/', validate({ params: tripParams }), documentController.list);
documentRouter.post(
  '/',
  upload.single('file'),
  requireFile,
  validate({ params: tripParams, body: documentMetaSchema }),
  documentController.create,
);
documentRouter.post(
  '/:docId/extract',
  validate({ params: docParams, body: ocrExtractSchema }),
  documentController.extract,
);
documentRouter.delete('/:docId', validate({ params: docParams }), documentController.remove);

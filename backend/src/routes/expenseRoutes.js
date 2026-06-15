import { Router } from 'express';
import { z } from 'zod';
import { createExpenseSchema, updateExpenseSchema, objectIdSchema } from '@pepetrip/shared';
import { validate } from '../middlewares/validate.js';
import * as expenseController from '../controllers/expenseController.js';

/** Mounted at /trips/:id/expenses (mergeParams keeps the trip :id). */
export const expenseRouter = Router({ mergeParams: true });

const tripParams = z.object({ id: objectIdSchema });
const expenseParams = z.object({ id: objectIdSchema, expenseId: objectIdSchema });

expenseRouter.get('/', validate({ params: tripParams }), expenseController.list);
expenseRouter.post(
  '/',
  validate({ params: tripParams, body: createExpenseSchema }),
  expenseController.create,
);
expenseRouter.patch(
  '/:expenseId',
  validate({ params: expenseParams, body: updateExpenseSchema }),
  expenseController.update,
);
expenseRouter.delete('/:expenseId', validate({ params: expenseParams }), expenseController.remove);

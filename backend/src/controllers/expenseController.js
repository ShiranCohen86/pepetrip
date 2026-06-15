import { sendData } from '../helpers/response.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { recordAudit } from '../middlewares/audit.js';
import * as expenseService from '../services/expenseService.js';

export const list = asyncHandler(async (req, res) => {
  const { expenses, summary } = await expenseService.listExpenses(req.valid.params.id, req.user.id);
  sendData(res, { expenses, summary });
});

export const create = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(
    req.valid.params.id,
    req.user.id,
    req.valid.body,
  );
  recordAudit(req, { action: 'expense.create', entity: 'Expense', entityId: expense.id });
  sendData(res, { expense }, { status: 201 });
});

export const update = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(
    req.valid.params.expenseId,
    req.user.id,
    req.valid.body,
  );
  recordAudit(req, { action: 'expense.update', entity: 'Expense', entityId: expense.id });
  sendData(res, { expense });
});

export const remove = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.valid.params.expenseId, req.user.id);
  recordAudit(req, {
    action: 'expense.delete',
    entity: 'Expense',
    entityId: req.valid.params.expenseId,
  });
  sendData(res, { ok: true });
});

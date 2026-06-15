import { convertCurrency, DEFAULT_CURRENCY, EXPENSE_CATEGORIES } from '@pepetrip/shared';
import { expenseRepository } from '../repositories/expenseRepository.js';
import { getOwnedTrip } from './tripService.js';
import { notFound } from '../errors/AppError.js';

function tripCurrency(trip) {
  return trip.currency || trip.budget?.currency || DEFAULT_CURRENCY;
}

/** Build a budget-vs-actual summary, converting every expense into the trip currency. */
function buildSummary(trip, expenses) {
  const currency = tripCurrency(trip);
  const byCategory = Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c, 0]));
  let total = 0;
  for (const e of expenses) {
    const converted = convertCurrency(e.amount, e.currency, currency);
    total += converted;
    byCategory[e.category] = (byCategory[e.category] ?? 0) + converted;
  }
  const budget = trip.budget?.amount ?? 0;
  return {
    currency,
    total: Math.round(total),
    count: expenses.length,
    budget,
    remaining: budget ? Math.round(budget - total) : null,
    byCategory: Object.fromEntries(Object.entries(byCategory).map(([k, v]) => [k, Math.round(v)])),
  };
}

export async function listExpenses(tripId, ownerId) {
  const trip = await getOwnedTrip(tripId, ownerId);
  const expenses = await expenseRepository.listByTrip(tripId, ownerId);
  return { expenses, summary: buildSummary(trip, expenses) };
}

export async function createExpense(tripId, ownerId, input) {
  await getOwnedTrip(tripId, ownerId); // ownership / existence guard
  return expenseRepository.create({
    ownerId,
    tripId,
    category: input.category,
    label: input.label,
    amount: input.amount,
    currency: input.currency,
    date: input.date ? new Date(input.date) : undefined,
    notes: input.notes,
  });
}

export async function updateExpense(id, ownerId, patch) {
  const expense = await expenseRepository.findByIdForOwner(id, ownerId);
  if (!expense) throw notFound('Expense not found');
  for (const field of ['category', 'label', 'amount', 'currency', 'notes']) {
    if (patch[field] !== undefined) expense[field] = patch[field];
  }
  if (patch.date !== undefined) expense.date = new Date(patch.date);
  await expense.save();
  return expense;
}

export async function deleteExpense(id, ownerId) {
  const deleted = await expenseRepository.deleteByIdForOwner(id, ownerId);
  if (!deleted) throw notFound('Expense not found');
  return deleted;
}

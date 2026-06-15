import { Expense } from '../models/Expense.js';

export const expenseRepository = {
  create: (data) => Expense.create(data),

  findByIdForOwner: (id, ownerId) => Expense.findOne({ _id: id, ownerId }),

  deleteByIdForOwner: (id, ownerId) => Expense.findOneAndDelete({ _id: id, ownerId }),

  listByTrip: (tripId, ownerId) =>
    Expense.find({ tripId, ownerId }).sort({ date: -1, createdAt: -1 }),
};

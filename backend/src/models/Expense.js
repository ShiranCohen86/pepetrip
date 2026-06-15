import mongoose from 'mongoose';
import { EXPENSE_CATEGORIES, CURRENCIES } from '@pepetrip/shared';
import { toJSONClean } from './plugins.js';

const expenseSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    category: { type: String, enum: EXPENSE_CATEGORIES, default: 'other' },
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: CURRENCIES, required: true },
    date: { type: Date },
    notes: { type: String },
  },
  { timestamps: true },
);

expenseSchema.index({ tripId: 1, date: -1 });

toJSONClean(expenseSchema);

export const Expense = mongoose.model('Expense', expenseSchema);

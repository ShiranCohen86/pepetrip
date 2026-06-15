import mongoose from 'mongoose';
import { PACKING_CATEGORIES, ACTIVITY_SOURCES } from '@pepetrip/shared';
import { toJSONClean } from './plugins.js';

const packingItemSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  category: { type: String, enum: PACKING_CATEGORIES, default: 'misc' },
  qty: { type: Number, min: 1 },
  packed: { type: Boolean, default: false },
  source: { type: String, enum: ACTIVITY_SOURCES, default: 'user' },
});

const packingListSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, unique: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [packingItemSchema], default: [] },
    generatedAt: { type: Date },
  },
  { timestamps: true },
);

toJSONClean(packingItemSchema);
toJSONClean(packingListSchema);

export const PackingList = mongoose.model('PackingList', packingListSchema);

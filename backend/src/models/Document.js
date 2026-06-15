import mongoose from 'mongoose';
import { DOCUMENT_TYPES } from '@pepetrip/shared';
import { toJSONClean } from './plugins.js';

const extractedSchema = new mongoose.Schema(
  {
    flightNumber: { type: String },
    confirmation: { type: String },
    dates: { type: [String], default: [] },
  },
  { _id: false },
);

const documentSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    type: { type: String, enum: DOCUMENT_TYPES, default: 'other' },
    title: { type: String, trim: true },
    url: { type: String, required: true },
    key: { type: String },
    filename: { type: String },
    mime: { type: String },
    size: { type: Number },
    ocrText: { type: String },
    extracted: { type: extractedSchema },
  },
  { timestamps: true },
);

documentSchema.index({ tripId: 1, createdAt: -1 });
toJSONClean(documentSchema);

export const Document = mongoose.model('Document', documentSchema);

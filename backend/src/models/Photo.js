import mongoose from 'mongoose';
import { toJSONClean } from './plugins.js';

const coordsSchema = new mongoose.Schema({ lat: Number, lng: Number }, { _id: false });

const photoSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    url: { type: String, required: true },
    key: { type: String },
    caption: { type: String, trim: true },
    takenAt: { type: Date },
    coords: { type: coordsSchema },
    mime: { type: String },
    size: { type: Number },
  },
  { timestamps: true },
);

photoSchema.index({ tripId: 1, createdAt: -1 });
toJSONClean(photoSchema);

export const Photo = mongoose.model('Photo', photoSchema);

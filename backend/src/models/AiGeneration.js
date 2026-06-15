import mongoose from 'mongoose';
import { toJSONClean } from './plugins.js';

/** Record of each AI itinerary generation — doubles as a cache (keyed by inputHash). */
const aiGenerationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', index: true },
    inputHash: { type: String, required: true, index: true },
    model: { type: String },
    promptVersion: { type: String },
    result: { type: mongoose.Schema.Types.Mixed },
    tokensUsed: { type: Number, default: 0 },
    fromCache: { type: Boolean, default: false },
  },
  { timestamps: true },
);

toJSONClean(aiGenerationSchema);

export const AiGeneration = mongoose.model('AiGeneration', aiGenerationSchema);

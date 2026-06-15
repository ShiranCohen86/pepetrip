import mongoose from 'mongoose';
import { toJSONClean } from './plugins.js';

/**
 * A refresh-token session. The refresh token itself is opaque + random; we only
 * store its SHA-256 hash. `family` groups a token's rotations so reuse of an old
 * token can revoke the whole family.
 */
const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    family: { type: String, required: true, index: true },
    userAgent: { type: String },
    ip: { type: String },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedByHash: { type: String },
  },
  { timestamps: true },
);

// TTL index — Mongo removes expired sessions automatically.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

toJSONClean(sessionSchema);

export const Session = mongoose.model('Session', sessionSchema);

import mongoose from 'mongoose';
import { toJSONClean } from './plugins.js';

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true },
    entity: { type: String },
    entityId: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

toJSONClean(auditLogSchema);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

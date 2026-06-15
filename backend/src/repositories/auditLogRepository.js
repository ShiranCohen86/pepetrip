import { AuditLog } from '../models/AuditLog.js';

export const auditLogRepository = {
  create: (data) => AuditLog.create(data),
};

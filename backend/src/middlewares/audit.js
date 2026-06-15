import { auditLogRepository } from '../repositories/auditLogRepository.js';
import { logger } from '../config/logger.js';

/**
 * Fire-and-forget audit record. Never throws into the request path — a failed
 * audit write is logged but does not break the user's action.
 * @param {import('express').Request} req
 * @param {{ action: string, entity?: string, entityId?: string, meta?: object }} entry
 */
export function recordAudit(req, { action, entity, entityId, meta }) {
  auditLogRepository
    .create({
      userId: req.user?.id,
      action,
      entity,
      entityId: entityId ? String(entityId) : undefined,
      meta,
      ip: req.ip,
    })
    .catch((err) => logger.warn({ err: err.message, action }, 'audit write failed'));
}

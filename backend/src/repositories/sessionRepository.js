import { Session } from '../models/Session.js';

export const sessionRepository = {
  create: (data) => Session.create(data),
  findActiveByTokenHash: (tokenHash) =>
    Session.findOne({ tokenHash, revokedAt: { $exists: false }, expiresAt: { $gt: new Date() } }),
  findByTokenHash: (tokenHash) => Session.findOne({ tokenHash }),
  revokeById: (id, replacedByHash) =>
    Session.findByIdAndUpdate(id, { revokedAt: new Date(), replacedByHash }, { new: true }),
  revokeFamily: (family) =>
    Session.updateMany({ family, revokedAt: { $exists: false } }, { revokedAt: new Date() }),
  revokeAllForUser: (userId) =>
    Session.updateMany({ userId, revokedAt: { $exists: false } }, { revokedAt: new Date() }),
};

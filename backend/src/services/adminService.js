import { User } from '../models/User.js';
import { Trip } from '../models/Trip.js';
import { Expense } from '../models/Expense.js';
import { AiGeneration } from '../models/AiGeneration.js';
import { AuditLog } from '../models/AuditLog.js';
import { getPagination, buildPageMeta } from '../helpers/pagination.js';

/** High-level system metrics + recent activity for the admin dashboard. */
export async function getOverview() {
  const [users, trips, expenses, aiGenerations, recentUsers, recentAudit] = await Promise.all([
    User.countDocuments(),
    Trip.countDocuments(),
    Expense.countDocuments(),
    AiGeneration.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(8),
    AuditLog.find().sort({ createdAt: -1 }).limit(20),
  ]);

  const aiTokens = await AiGeneration.aggregate([
    { $group: { _id: null, total: { $sum: '$tokensUsed' } } },
  ]);

  return {
    counts: {
      users,
      trips,
      expenses,
      aiGenerations,
      aiTokens: aiTokens[0]?.total ?? 0,
    },
    recentUsers: recentUsers.map((u) => u.toJSON()),
    recentAudit: recentAudit.map((a) => a.toJSON()),
  };
}

export async function listUsers({ page, limit }) {
  const { skip } = getPagination({ page, limit });
  const [items, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  return { items: items.map((u) => u.toJSON()), meta: buildPageMeta({ page, limit, total }) };
}

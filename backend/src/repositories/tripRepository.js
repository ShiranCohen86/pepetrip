import { Trip } from '../models/Trip.js';

/** Owner OR an accepted member — used for read access (group travel). */
const accessFilter = (userId) => ({ $or: [{ ownerId: userId }, { 'members.userId': userId }] });

export const tripRepository = {
  create: (data) => Trip.create(data),

  findByIdForOwner: (id, ownerId) => Trip.findOne({ _id: id, ownerId }),

  findAccessible: (id, userId) => Trip.findOne({ _id: id, ...accessFilter(userId) }),

  deleteByIdForOwner: (id, ownerId) => Trip.findOneAndDelete({ _id: id, ownerId }),

  countByOwner: (ownerId, filter = {}) => Trip.countDocuments({ ownerId, ...filter }),

  countAccessible: (userId, filter = {}) =>
    Trip.countDocuments({ ...accessFilter(userId), ...filter }),

  listByOwner: (ownerId, { filter = {}, skip = 0, limit = 20 } = {}) =>
    Trip.find({ ownerId, ...filter })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  listAccessible: (userId, { filter = {}, skip = 0, limit = 20 } = {}) =>
    Trip.find({ ...accessFilter(userId), ...filter })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
};

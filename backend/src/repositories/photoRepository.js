import { Photo } from '../models/Photo.js';

export const photoRepository = {
  create: (data) => Photo.create(data),
  findByIdForOwner: (id, ownerId) => Photo.findOne({ _id: id, ownerId }),
  deleteByIdForOwner: (id, ownerId) => Photo.findOneAndDelete({ _id: id, ownerId }),
  listByTrip: (tripId, ownerId) =>
    Photo.find({ tripId, ownerId }).sort({ takenAt: -1, createdAt: -1 }),
};

import { Document } from '../models/Document.js';

export const documentRepository = {
  create: (data) => Document.create(data),
  findByIdForOwner: (id, ownerId) => Document.findOne({ _id: id, ownerId }),
  deleteByIdForOwner: (id, ownerId) => Document.findOneAndDelete({ _id: id, ownerId }),
  listByTrip: (tripId, ownerId) => Document.find({ tripId, ownerId }).sort({ createdAt: -1 }),
};

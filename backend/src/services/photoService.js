import { photoRepository } from '../repositories/photoRepository.js';
import { getOwnedTrip } from './tripService.js';
import { storage } from './storage/index.js';
import { notFound } from '../errors/AppError.js';

export async function listPhotos(tripId, ownerId) {
  await getOwnedTrip(tripId, ownerId);
  return photoRepository.listByTrip(tripId, ownerId);
}

export async function addPhoto(tripId, ownerId, file, meta = {}) {
  await getOwnedTrip(tripId, ownerId);
  const { url, key } = await storage.save(file.buffer, file.originalname, file.mimetype);
  return photoRepository.create({
    ownerId,
    tripId,
    url,
    key,
    caption: meta.caption,
    takenAt: meta.takenAt ? new Date(meta.takenAt) : undefined,
    coords: meta.coords,
    mime: file.mimetype,
    size: file.size,
  });
}

export async function deletePhoto(id, ownerId) {
  const photo = await photoRepository.findByIdForOwner(id, ownerId);
  if (!photo) throw notFound('Photo not found');
  await storage.remove(photo.key);
  await photo.deleteOne();
  return photo;
}

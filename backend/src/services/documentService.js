import { documentRepository } from '../repositories/documentRepository.js';
import { getOwnedTrip } from './tripService.js';
import { storage } from './storage/index.js';
import { extractFields } from './documentExtract.js';
import { notFound } from '../errors/AppError.js';

export async function listDocuments(tripId, ownerId) {
  await getOwnedTrip(tripId, ownerId);
  return documentRepository.listByTrip(tripId, ownerId);
}

export async function addDocument(tripId, ownerId, file, meta = {}) {
  await getOwnedTrip(tripId, ownerId);
  const { url, key } = await storage.save(file.buffer, file.originalname, file.mimetype);
  return documentRepository.create({
    ownerId,
    tripId,
    type: meta.type ?? 'other',
    title: meta.title || file.originalname,
    url,
    key,
    filename: file.originalname,
    mime: file.mimetype,
    size: file.size,
  });
}

/** Store OCR'd/pasted text and parse structured travel fields from it. */
export async function extractDocument(id, ownerId, text) {
  const doc = await documentRepository.findByIdForOwner(id, ownerId);
  if (!doc) throw notFound('Document not found');
  doc.ocrText = text;
  doc.extracted = extractFields(text);
  await doc.save();
  return doc;
}

export async function deleteDocument(id, ownerId) {
  const doc = await documentRepository.findByIdForOwner(id, ownerId);
  if (!doc) throw notFound('Document not found');
  await storage.remove(doc.key);
  await doc.deleteOne();
  return doc;
}

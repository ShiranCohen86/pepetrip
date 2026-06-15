import { http, unwrap } from './http.js';

export const documentApi = {
  list: (tripId) => unwrap(http.get(`/trips/${tripId}/documents`)),
  upload: (tripId, formData) => unwrap(http.post(`/trips/${tripId}/documents`, formData)),
  extract: (tripId, docId, text) =>
    unwrap(http.post(`/trips/${tripId}/documents/${docId}/extract`, { text })),
  remove: (tripId, docId) => unwrap(http.delete(`/trips/${tripId}/documents/${docId}`)),
};

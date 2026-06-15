import { http, unwrap } from './http.js';

export const photoApi = {
  list: (tripId) => unwrap(http.get(`/trips/${tripId}/photos`)),
  upload: (tripId, formData) => unwrap(http.post(`/trips/${tripId}/photos`, formData)),
  remove: (tripId, photoId) => unwrap(http.delete(`/trips/${tripId}/photos/${photoId}`)),
};

import { http, unwrap } from './http.js';

export const packingApi = {
  get: (tripId) => unwrap(http.get(`/trips/${tripId}/packing`)),
  generate: (tripId) => unwrap(http.post(`/trips/${tripId}/packing/generate`)),
  addItem: (tripId, body) => unwrap(http.post(`/trips/${tripId}/packing/items`, body)),
  updateItem: (tripId, itemId, body) =>
    unwrap(http.patch(`/trips/${tripId}/packing/items/${itemId}`, body)),
  deleteItem: (tripId, itemId) => unwrap(http.delete(`/trips/${tripId}/packing/items/${itemId}`)),
};

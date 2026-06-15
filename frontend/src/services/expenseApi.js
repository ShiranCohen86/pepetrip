import { http, unwrap } from './http.js';

export const expenseApi = {
  list: (tripId) => unwrap(http.get(`/trips/${tripId}/expenses`)),
  create: (tripId, body) => unwrap(http.post(`/trips/${tripId}/expenses`, body)),
  update: (tripId, expenseId, body) =>
    unwrap(http.patch(`/trips/${tripId}/expenses/${expenseId}`, body)),
  remove: (tripId, expenseId) => unwrap(http.delete(`/trips/${tripId}/expenses/${expenseId}`)),
};

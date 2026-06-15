import { http, unwrap } from './http.js';

export const weatherApi = {
  forTrip: (tripId) => unwrap(http.get(`/trips/${tripId}/weather`)),
};

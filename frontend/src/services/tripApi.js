import { http, unwrap } from './http.js';

export const tripApi = {
  list: (params = {}) => unwrap(http.get('/trips', { params })),
  get: (id) => unwrap(http.get(`/trips/${id}`)),
  create: (body) => unwrap(http.post('/trips', body)),
  update: (id, body) => unwrap(http.patch(`/trips/${id}`, body)),
  remove: (id) => unwrap(http.delete(`/trips/${id}`)),
  generate: (id) => unwrap(http.post(`/trips/${id}/generate`)),
  reorder: (id, body) => unwrap(http.patch(`/trips/${id}/reorder`, body)),
  addActivity: (id, dayId, body) =>
    unwrap(http.post(`/trips/${id}/days/${dayId}/activities`, body)),
  updateActivity: (id, dayId, activityId, body) =>
    unwrap(http.patch(`/trips/${id}/days/${dayId}/activities/${activityId}`, body)),
  deleteActivity: (id, dayId, activityId) =>
    unwrap(http.delete(`/trips/${id}/days/${dayId}/activities/${activityId}`)),
  addMember: (id, body) => unwrap(http.post(`/trips/${id}/members`, body)),
  removeMember: (id, memberId) => unwrap(http.delete(`/trips/${id}/members/${memberId}`)),
  share: (id) => unwrap(http.post(`/trips/${id}/share`)),
  unshare: (id) => unwrap(http.delete(`/trips/${id}/share`)),
  getShared: (token) => unwrap(http.get(`/shared/${token}`)),
};

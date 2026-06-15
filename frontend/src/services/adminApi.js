import { http, unwrap } from './http.js';

export const adminApi = {
  overview: () => unwrap(http.get('/admin/overview')),
  users: (params = {}) => unwrap(http.get('/admin/users', { params })),
};

import { http, unwrap } from './http.js';

export const statsApi = {
  get: () => unwrap(http.get('/stats')),
  achievements: () => unwrap(http.get('/stats/achievements')),
};

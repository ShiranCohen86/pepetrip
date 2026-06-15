import { http, unwrap } from './http.js';

export const configApi = {
  get: () => unwrap(http.get('/config')),
};

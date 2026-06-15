import { http, unwrap } from './http.js';

export const authApi = {
  googleLogin: (credential) => unwrap(http.post('/auth/google', { credential })),
  devLogin: () => unwrap(http.post('/auth/dev-login')),
  refresh: () => unwrap(http.post('/auth/refresh')),
  logout: () => unwrap(http.post('/auth/logout')),
  me: () => unwrap(http.get('/auth/me')),
  updatePreferences: (preferences) => unwrap(http.patch('/auth/preferences', preferences)),
};

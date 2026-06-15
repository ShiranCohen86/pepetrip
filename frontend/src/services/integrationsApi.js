import { http, unwrap } from './http.js';

export const integrationsApi = {
  list: () => unwrap(http.get('/integrations')),
  sync: (key) => unwrap(http.post(`/integrations/${key}/sync`)),
};

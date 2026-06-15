import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app, makeUser, authHeader } from './helpers.js';

describe('integrations API (gated)', () => {
  it('lists integrations, all disabled by default', async () => {
    const auth = authHeader(await makeUser());
    const res = await request(app)
      .get('/api/v1/integrations')
      .set('Authorization', auth)
      .expect(200);
    const { integrations } = res.body.data;
    expect(integrations.length).toBeGreaterThanOrEqual(3);
    expect(integrations.every((i) => i.enabled === false)).toBe(true);
    expect(integrations.find((i) => i.key === 'gmail').requirement).toMatch(/verification/i);
  });

  it('returns an honest 503 when syncing a disabled integration', async () => {
    const auth = authHeader(await makeUser());
    const res = await request(app)
      .post('/api/v1/integrations/gmail/sync')
      .set('Authorization', auth)
      .expect(503);
    expect(res.body.error.message).toMatch(/not available/i);
  });

  it('404s an unknown integration', async () => {
    const auth = authHeader(await makeUser());
    await request(app)
      .post('/api/v1/integrations/teleporter/sync')
      .set('Authorization', auth)
      .expect(404);
  });
});

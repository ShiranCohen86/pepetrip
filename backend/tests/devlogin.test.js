import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from './helpers.js';

describe('dev login (gated demo user)', () => {
  it('signs in a demo user and issues a working token', async () => {
    const res = await request(app).post('/api/v1/auth/dev-login').expect(200);
    expect(res.body.data.user.email).toBe('demo@pepetrip.local');
    expect(res.body.data.user.roles).toContain('admin');
    const token = res.body.data.accessToken;

    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(me.body.data.user.email).toBe('demo@pepetrip.local');
  });

  it('reuses the same demo account on repeat calls', async () => {
    const a = await request(app).post('/api/v1/auth/dev-login').expect(200);
    const b = await request(app).post('/api/v1/auth/dev-login').expect(200);
    expect(a.body.data.user.id).toBe(b.body.data.user.id);
  });
});

import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from './helpers.js';
import { config } from '../src/config/env.js';

const distExists = fs.existsSync(path.join(config.repoRoot, 'backend', 'public', 'index.html'));

describe('app surface', () => {
  it('reports health', async () => {
    const res = await request(app).get('/api/v1/health').expect(200);
    expect(res.body.data.status).toBe('ok');
  });

  it('exposes public config', async () => {
    const res = await request(app).get('/api/v1/config').expect(200);
    expect(res.body.data).toHaveProperty('googleClientId');
  });

  it('returns a JSON 404 for unknown api routes', async () => {
    const res = await request(app).get('/api/v1/does-not-exist').expect(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it.skipIf(!distExists)('serves the SPA for deep links (single-service)', async () => {
    const res = await request(app).get('/trips/abc123').expect(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });
});

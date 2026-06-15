import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app, makeUser, authHeader, validTripBody } from './helpers.js';

async function createTrip(auth, body = validTripBody) {
  const res = await request(app).post('/api/v1/trips').set('Authorization', auth).send(body);
  return res.body.data.trip;
}

describe('public trip sharing', () => {
  it('creates a share link and serves a sanitized public view (no auth)', async () => {
    const auth = authHeader(await makeUser());
    const trip = await createTrip(auth, { ...validTripBody, notes: 'my private notes' });

    const shared = await request(app)
      .post(`/api/v1/trips/${trip.id}/share`)
      .set('Authorization', auth)
      .expect(200);
    const { shareToken } = shared.body.data;
    expect(shareToken).toBeTruthy();

    // Public read — no Authorization header.
    const pub = await request(app).get(`/api/v1/shared/${shareToken}`).expect(200);
    const publicTrip = pub.body.data.trip;

    expect(publicTrip.title).toContain('Kyoto');
    expect(publicTrip.days).toHaveLength(3);
    // Private fields must be stripped.
    expect(publicTrip.ownerId).toBeUndefined();
    expect(publicTrip.members).toBeUndefined();
    expect(publicTrip.shareToken).toBeUndefined();
    expect(publicTrip.notes).toBeUndefined();
  });

  it('returns the same token when sharing twice (idempotent)', async () => {
    const auth = authHeader(await makeUser());
    const trip = await createTrip(auth);
    const first = await request(app).post(`/api/v1/trips/${trip.id}/share`).set('Authorization', auth);
    const second = await request(app).post(`/api/v1/trips/${trip.id}/share`).set('Authorization', auth);
    expect(second.body.data.shareToken).toBe(first.body.data.shareToken);
  });

  it('only the owner can share', async () => {
    const owner = authHeader(await makeUser());
    const other = authHeader(await makeUser());
    const trip = await createTrip(owner);
    await request(app).post(`/api/v1/trips/${trip.id}/share`).set('Authorization', other).expect(404);
  });

  it('revoking the link makes it stop working', async () => {
    const auth = authHeader(await makeUser());
    const trip = await createTrip(auth);
    const { shareToken } = (
      await request(app).post(`/api/v1/trips/${trip.id}/share`).set('Authorization', auth)
    ).body.data;

    await request(app).get(`/api/v1/shared/${shareToken}`).expect(200);
    await request(app).delete(`/api/v1/trips/${trip.id}/share`).set('Authorization', auth).expect(200);
    await request(app).get(`/api/v1/shared/${shareToken}`).expect(404);
  });

  it('returns 404 for an unknown token', async () => {
    await request(app).get('/api/v1/shared/does-not-exist').expect(404);
  });
});

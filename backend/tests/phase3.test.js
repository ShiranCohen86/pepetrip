import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app, makeUser, authHeader, validTripBody } from './helpers.js';

async function createTrip(auth, body = validTripBody) {
  const res = await request(app).post('/api/v1/trips').set('Authorization', auth).send(body);
  return res.body.data.trip;
}

describe('stats API', () => {
  it('requires authentication', async () => {
    await request(app).get('/api/v1/stats').expect(401);
  });

  it('aggregates a travel footprint across trips', async () => {
    const auth = authHeader(await makeUser());

    await createTrip(auth, {
      ...validTripBody,
      destination: { label: 'Kyoto, Japan', country: 'Japan', city: 'Kyoto' },
    });
    const second = await createTrip(auth, {
      ...validTripBody,
      destination: {
        label: 'Lisbon, Portugal',
        country: 'Portugal',
        city: 'Lisbon',
        coords: { lat: 38.72, lng: -9.14 },
      },
    });

    // Mark the second trip completed so the "completed" counter moves.
    await request(app)
      .patch(`/api/v1/trips/${second.id}`)
      .set('Authorization', auth)
      .send({ status: 'completed' })
      .expect(200);

    const res = await request(app).get('/api/v1/stats').set('Authorization', auth).expect(200);
    const { stats } = res.body.data;

    expect(stats.trips).toBe(2);
    expect(stats.countries).toBe(2);
    expect(stats.cities).toBe(2);
    expect(stats.totalDays).toBeGreaterThan(0);
    expect(stats.completed).toBe(1);
    expect(stats.places).toHaveLength(2);
    expect(stats.places.find((p) => p.city === 'Lisbon').coords).toMatchObject({ lat: 38.72 });
  });

  it('isolates stats per user', async () => {
    const owner = authHeader(await makeUser());
    await createTrip(owner);
    const other = authHeader(await makeUser());
    const res = await request(app).get('/api/v1/stats').set('Authorization', other).expect(200);
    expect(res.body.data.stats.trips).toBe(0);
  });
});

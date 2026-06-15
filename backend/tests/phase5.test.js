import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app, makeUser, authHeader, validTripBody } from './helpers.js';

async function createTrip(auth, body = validTripBody) {
  const res = await request(app).post('/api/v1/trips').set('Authorization', auth).send(body);
  return res.body.data.trip;
}

describe('achievements API', () => {
  it('earns the first-trip badge after creating a trip', async () => {
    const auth = authHeader(await makeUser());
    await createTrip(auth);
    const res = await request(app)
      .get('/api/v1/stats/achievements')
      .set('Authorization', auth)
      .expect(200);
    const { badges, earnedCount } = res.body.data;
    expect(badges.find((b) => b.key === 'first_trip').earned).toBe(true);
    expect(badges.find((b) => b.key === 'globetrotter').earned).toBe(false);
    expect(earnedCount).toBeGreaterThanOrEqual(1);
  });
});

describe('admin API (RBAC)', () => {
  it('forbids non-admins', async () => {
    const auth = authHeader(await makeUser());
    await request(app).get('/api/v1/admin/overview').set('Authorization', auth).expect(403);
  });

  it('serves an overview to admins', async () => {
    const admin = authHeader(await makeUser({ roles: ['user', 'admin'] }));
    const res = await request(app)
      .get('/api/v1/admin/overview')
      .set('Authorization', admin)
      .expect(200);
    expect(res.body.data.counts).toHaveProperty('users');
    expect(Array.isArray(res.body.data.recentUsers)).toBe(true);
  });
});

describe('group travel (members)', () => {
  it('grants a member read access and revokes it on removal', async () => {
    const owner = await makeUser();
    const member = await makeUser();
    const ownerAuth = authHeader(owner);
    const memberAuth = authHeader(member);
    const trip = await createTrip(ownerAuth);

    // Member cannot see it yet.
    await request(app).get(`/api/v1/trips/${trip.id}`).set('Authorization', memberAuth).expect(404);

    // Owner invites the member by email.
    const added = await request(app)
      .post(`/api/v1/trips/${trip.id}/members`)
      .set('Authorization', ownerAuth)
      .send({ email: member.email, role: 'viewer' })
      .expect(201);
    const memberId = added.body.data.members[0].id;

    // Now the member can read it and it shows in their list.
    await request(app).get(`/api/v1/trips/${trip.id}`).set('Authorization', memberAuth).expect(200);
    const list = await request(app)
      .get('/api/v1/trips')
      .set('Authorization', memberAuth)
      .expect(200);
    expect(list.body.data.trips.some((t) => t.id === trip.id)).toBe(true);

    // Members cannot delete the trip (owner-only).
    await request(app)
      .delete(`/api/v1/trips/${trip.id}`)
      .set('Authorization', memberAuth)
      .expect(404);

    // Owner removes the member → access revoked.
    await request(app)
      .delete(`/api/v1/trips/${trip.id}/members/${memberId}`)
      .set('Authorization', ownerAuth)
      .expect(200);
    await request(app).get(`/api/v1/trips/${trip.id}`).set('Authorization', memberAuth).expect(404);
  });
});

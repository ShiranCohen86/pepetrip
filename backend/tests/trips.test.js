import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app, makeUser, authHeader, validTripBody } from './helpers.js';
import { setAiProvider } from '../src/services/ai/index.js';

const mockProvider = (days, counter = {}) => ({
  generateItinerary: async () => {
    counter.calls = (counter.calls ?? 0) + 1;
    return {
      raw: JSON.stringify({ overview: 'A lovely trip', days }),
      tokensUsed: 5,
      model: 'mock',
    };
  },
});

describe('trips API', () => {
  it('requires authentication', async () => {
    await request(app).get('/api/v1/trips').expect(401);
  });

  it('creates a trip with day placeholders and lists it', async () => {
    const auth = authHeader(await makeUser());
    const created = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', auth)
      .send(validTripBody)
      .expect(201);

    expect(created.body.data.trip.title).toContain('Kyoto');
    expect(created.body.data.trip.days).toHaveLength(3);

    const list = await request(app).get('/api/v1/trips').set('Authorization', auth).expect(200);
    expect(list.body.data.trips).toHaveLength(1);
  });

  it('rejects an invalid body', async () => {
    const auth = authHeader(await makeUser());
    await request(app)
      .post('/api/v1/trips')
      .set('Authorization', auth)
      .send({ ...validTripBody, destination: { label: '' } })
      .expect(400);
  });

  it('isolates trips by owner', async () => {
    const owner = await makeUser();
    const other = await makeUser();
    const created = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', authHeader(owner))
      .send(validTripBody);
    const id = created.body.data.trip.id;

    await request(app)
      .get(`/api/v1/trips/${id}`)
      .set('Authorization', authHeader(other))
      .expect(404);
  });

  it('generates an itinerary (mocked AI) and serves a repeat from cache', async () => {
    const counter = {};
    setAiProvider(
      mockProvider(
        [
          {
            summary: 'Day 1',
            activities: [
              {
                type: 'attraction',
                title: 'Temple',
                description: 'Nice',
                estimatedCost: { amount: 10 },
              },
            ],
          },
        ],
        counter,
      ),
    );
    const auth = authHeader(await makeUser());
    const created = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', auth)
      .send(validTripBody);
    const id = created.body.data.trip.id;

    const gen = await request(app)
      .post(`/api/v1/trips/${id}/generate`)
      .set('Authorization', auth)
      .expect(200);
    expect(gen.body.data.trip.status).toBe('planned');
    expect(gen.body.data.trip.days[0].activities[0].title).toBe('Temple');
    expect(gen.body.data.trip.days[0].activities[0].estimatedCost.currency).toBe('USD');

    await request(app).post(`/api/v1/trips/${id}/generate`).set('Authorization', auth).expect(200);
    expect(counter.calls).toBe(1); // second call hit the cache
  });

  it('reorders, adds, edits and deletes activities', async () => {
    setAiProvider(
      mockProvider([
        {
          summary: '',
          activities: [
            { type: 'activity', title: 'A', description: '' },
            { type: 'activity', title: 'B', description: '' },
          ],
        },
      ]),
    );
    const auth = authHeader(await makeUser());
    const created = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', auth)
      .send(validTripBody);
    const id = created.body.data.trip.id;
    const gen = await request(app).post(`/api/v1/trips/${id}/generate`).set('Authorization', auth);
    const day = gen.body.data.trip.days[0];
    const [a1, a2] = day.activities;

    const reordered = await request(app)
      .patch(`/api/v1/trips/${id}/reorder`)
      .set('Authorization', auth)
      .send({ days: [{ id: day.id, activityIds: [a2.id, a1.id] }] })
      .expect(200);
    expect(reordered.body.data.trip.days[0].activities[0].id).toBe(a2.id);

    const added = await request(app)
      .post(`/api/v1/trips/${id}/days/${day.id}/activities`)
      .set('Authorization', auth)
      .send({ title: 'New stop', type: 'restaurant' })
      .expect(201);
    const newDay = added.body.data.trip.days[0];
    expect(newDay.activities).toHaveLength(3);
    const newAct = newDay.activities.find((a) => a.title === 'New stop');

    await request(app)
      .patch(`/api/v1/trips/${id}/days/${day.id}/activities/${newAct.id}`)
      .set('Authorization', auth)
      .send({ title: 'Renamed' })
      .expect(200);

    const deleted = await request(app)
      .delete(`/api/v1/trips/${id}/days/${day.id}/activities/${newAct.id}`)
      .set('Authorization', auth)
      .expect(200);
    expect(deleted.body.data.trip.days[0].activities).toHaveLength(2);
  });

  it('deletes a trip', async () => {
    const auth = authHeader(await makeUser());
    const created = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', auth)
      .send(validTripBody);
    const id = created.body.data.trip.id;
    await request(app).delete(`/api/v1/trips/${id}`).set('Authorization', auth).expect(200);
    await request(app).get(`/api/v1/trips/${id}`).set('Authorization', auth).expect(404);
  });
});

import request from 'supertest';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { app, makeUser, authHeader, validTripBody } from './helpers.js';
import { setAiProvider } from '../src/services/ai/index.js';

const iso = (offsetDays) =>
  new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);

async function createTrip(auth, body = validTripBody) {
  const res = await request(app).post('/api/v1/trips').set('Authorization', auth).send(body);
  return res.body.data.trip.id;
}

describe('expenses API', () => {
  it('tracks expenses and summarises them in the trip currency', async () => {
    const auth = authHeader(await makeUser());
    const id = await createTrip(auth);

    await request(app)
      .post(`/api/v1/trips/${id}/expenses`)
      .set('Authorization', auth)
      .send({ category: 'food', label: 'Sushi', amount: 30, currency: 'USD' })
      .expect(201);

    await request(app)
      .post(`/api/v1/trips/${id}/expenses`)
      .set('Authorization', auth)
      .send({ category: 'transport', label: 'Train', amount: 10, currency: 'EUR' })
      .expect(201);

    const list = await request(app)
      .get(`/api/v1/trips/${id}/expenses`)
      .set('Authorization', auth)
      .expect(200);

    expect(list.body.data.expenses).toHaveLength(2);
    const { summary } = list.body.data;
    expect(summary.currency).toBe('USD');
    // 30 USD + (10 EUR / 0.92) ≈ 40.87 → 41
    expect(summary.total).toBe(41);
    expect(summary.byCategory.food).toBe(30);
    expect(summary.budget).toBe(1500);
    expect(summary.remaining).toBe(1459);
  });

  it("blocks access to another user's trip expenses", async () => {
    const owner = authHeader(await makeUser());
    const other = authHeader(await makeUser());
    const id = await createTrip(owner);
    await request(app).get(`/api/v1/trips/${id}/expenses`).set('Authorization', other).expect(404);
  });

  it('updates and deletes an expense', async () => {
    const auth = authHeader(await makeUser());
    const id = await createTrip(auth);
    const created = await request(app)
      .post(`/api/v1/trips/${id}/expenses`)
      .set('Authorization', auth)
      .send({ category: 'food', label: 'Lunch', amount: 12, currency: 'USD' });
    const expenseId = created.body.data.expense.id;

    await request(app)
      .patch(`/api/v1/trips/${id}/expenses/${expenseId}`)
      .set('Authorization', auth)
      .send({ amount: 20 })
      .expect(200);

    await request(app)
      .delete(`/api/v1/trips/${id}/expenses/${expenseId}`)
      .set('Authorization', auth)
      .expect(200);

    const list = await request(app).get(`/api/v1/trips/${id}/expenses`).set('Authorization', auth);
    expect(list.body.data.expenses).toHaveLength(0);
  });
});

describe('packing API', () => {
  it('generates a packing list (mocked AI), preserves packed state, and toggles items', async () => {
    setAiProvider({
      generatePackingList: async () => ({
        raw: JSON.stringify({
          items: [
            { label: 'Passport', category: 'documents' },
            { label: 'T-shirts', category: 'clothing', qty: 5 },
          ],
        }),
        tokensUsed: 3,
        model: 'mock',
      }),
    });

    const auth = authHeader(await makeUser());
    const id = await createTrip(auth);

    const gen = await request(app)
      .post(`/api/v1/trips/${id}/packing/generate`)
      .set('Authorization', auth)
      .expect(200);
    expect(gen.body.data.packing.items).toHaveLength(2);
    const passport = gen.body.data.packing.items.find((i) => i.label === 'Passport');
    expect(passport.source).toBe('ai');

    // Toggle packed, then regenerate → packed state preserved by label.
    await request(app)
      .patch(`/api/v1/trips/${id}/packing/items/${passport.id}`)
      .set('Authorization', auth)
      .send({ packed: true })
      .expect(200);

    const regen = await request(app)
      .post(`/api/v1/trips/${id}/packing/generate`)
      .set('Authorization', auth)
      .expect(200);
    expect(regen.body.data.packing.items.find((i) => i.label === 'Passport').packed).toBe(true);
  });

  it('adds a manual packing item', async () => {
    const auth = authHeader(await makeUser());
    const id = await createTrip(auth);
    const res = await request(app)
      .post(`/api/v1/trips/${id}/packing/items`)
      .set('Authorization', auth)
      .send({ label: 'Sunscreen', category: 'toiletries' })
      .expect(201);
    expect(res.body.data.packing.items[0].label).toBe('Sunscreen');
    expect(res.body.data.packing.items[0].source).toBe('user');
  });
});

describe('weather API', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns a forecast for a near-term trip (mocked upstream)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          daily: {
            time: [iso(2), iso(3), iso(4)],
            weather_code: [0, 2, 61],
            temperature_2m_max: [25, 26, 22],
            temperature_2m_min: [15, 16, 14],
            precipitation_probability_max: [0, 10, 80],
          },
        }),
      })),
    );

    const auth = authHeader(await makeUser());
    const id = await createTrip(auth, {
      ...validTripBody,
      destination: { label: 'Lisbon, Portugal', coords: { lat: 38.72, lng: -9.14 } },
      startDate: iso(2),
      endDate: iso(4),
    });

    const res = await request(app)
      .get(`/api/v1/trips/${id}/weather`)
      .set('Authorization', auth)
      .expect(200);
    expect(res.body.data.weather.available).toBe(true);
    expect(res.body.data.weather.daily).toHaveLength(3);
    expect(res.body.data.weather.daily[0].emoji).toBe('☀️');
  });

  it('reports unavailable for trips beyond the forecast horizon', async () => {
    const auth = authHeader(await makeUser());
    const id = await createTrip(auth, {
      ...validTripBody,
      startDate: iso(120),
      endDate: iso(122),
    });
    const res = await request(app)
      .get(`/api/v1/trips/${id}/weather`)
      .set('Authorization', auth)
      .expect(200);
    expect(res.body.data.weather.available).toBe(false);
  });
});

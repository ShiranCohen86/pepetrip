import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app, makeUser, authHeader, validTripBody } from './helpers.js';
import { extractFields } from '../src/services/documentExtract.js';

async function createTrip(auth) {
  const res = await request(app)
    .post('/api/v1/trips')
    .set('Authorization', auth)
    .send(validTripBody);
  return res.body.data.trip.id;
}

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

describe('documentExtract util', () => {
  it('pulls flight number, confirmation and dates from text', () => {
    const text = 'Flight LH401 confirmation ABC123 departing 2026-09-01 from Frankfurt.';
    const out = extractFields(text);
    expect(out.flightNumber).toBe('LH401');
    expect(out.confirmation).toBe('ABC123');
    expect(out.dates).toContain('2026-09-01');
  });
});

describe('photos API', () => {
  it('uploads, lists and deletes a trip photo', async () => {
    const auth = authHeader(await makeUser());
    const id = await createTrip(auth);

    const up = await request(app)
      .post(`/api/v1/trips/${id}/photos`)
      .set('Authorization', auth)
      .field('caption', 'Sunset')
      .attach('file', PNG, 'sunset.png')
      .expect(201);
    expect(up.body.data.photo.url).toMatch(/^\/uploads\//);
    expect(up.body.data.photo.caption).toBe('Sunset');
    const photoId = up.body.data.photo.id;

    const list = await request(app)
      .get(`/api/v1/trips/${id}/photos`)
      .set('Authorization', auth)
      .expect(200);
    expect(list.body.data.photos).toHaveLength(1);

    await request(app)
      .delete(`/api/v1/trips/${id}/photos/${photoId}`)
      .set('Authorization', auth)
      .expect(200);
  });

  it('rejects an upload with no file', async () => {
    const auth = authHeader(await makeUser());
    const id = await createTrip(auth);
    await request(app).post(`/api/v1/trips/${id}/photos`).set('Authorization', auth).expect(400);
  });
});

describe('documents API + OCR extraction', () => {
  it('uploads a document then extracts fields from its text', async () => {
    const auth = authHeader(await makeUser());
    const id = await createTrip(auth);

    const up = await request(app)
      .post(`/api/v1/trips/${id}/documents`)
      .set('Authorization', auth)
      .field('type', 'flight_ticket')
      .attach('file', PNG, 'ticket.png')
      .expect(201);
    const docId = up.body.data.document.id;
    expect(up.body.data.document.type).toBe('flight_ticket');

    const extracted = await request(app)
      .post(`/api/v1/trips/${id}/documents/${docId}/extract`)
      .set('Authorization', auth)
      .send({ text: 'Booking reference XYZ789 — flight BA117 on 2026-09-02.' })
      .expect(200);
    expect(extracted.body.data.document.extracted.flightNumber).toBe('BA117');
    expect(extracted.body.data.document.extracted.confirmation).toBe('XYZ789');
  });
});

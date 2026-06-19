import { beforeAll, afterAll, afterEach, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { startTestDb, stopTestDb, clearDb } from '../helpers/db';
import { registerUser, bearer } from '../helpers/api';

const app = createApp();

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearDb);

describe('capture: create + persist (US1, FR-1.2/1.3/2.3, SC-5)', () => {
  it('creates an entry, defaulting occurredAt to now and setting an immutable createdAt', async () => {
    const { token } = await registerUser(app);
    const before = Date.now();

    const res = await request(app)
      .post('/api/entries')
      .set(bearer(token))
      .send({ body: 'finished the OPNsense base config' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    expect(res.body.body).toBe('finished the OPNsense base config');
    expect(res.body.source).toBe('manual');
    expect(res.body.deleted).toBe(false);
    expect(res.body).not.toHaveProperty('userId');

    const occurredAt = new Date(res.body.occurredAt).getTime();
    expect(occurredAt).toBeGreaterThanOrEqual(before - 1000);
    expect(occurredAt).toBeLessThanOrEqual(Date.now() + 1000);
    expect(new Date(res.body.createdAt).getTime()).not.toBeNaN();
  });

  it('rejects an empty or whitespace-only body (FR-1.x, 422)', async () => {
    const { token } = await registerUser(app);

    const empty = await request(app).post('/api/entries').set(bearer(token)).send({ body: '' });
    expect(empty.status).toBe(422);

    const spaces = await request(app)
      .post('/api/entries')
      .set(bearer(token))
      .send({ body: '   \n  ' });
    expect(spaces.status).toBe(422);
  });

  it('honors a provided occurredAt and ignores a client-supplied createdAt', async () => {
    const { token } = await registerUser(app);
    const occurredAt = '2025-01-02T03:04:05.000Z';
    const forgedCreatedAt = '2000-01-01T00:00:00.000Z';

    const res = await request(app)
      .post('/api/entries')
      .set(bearer(token))
      .send({ body: 'backdated capture', occurredAt, createdAt: forgedCreatedAt });

    expect(res.status).toBe(201);
    expect(new Date(res.body.occurredAt).toISOString()).toBe(occurredAt);
    // createdAt is server-set; the forged value is ignored.
    expect(res.body.createdAt).not.toBe(forgedCreatedAt);
  });

  it('persists a committed entry so it is readable on the timeline (SC-5)', async () => {
    const { token } = await registerUser(app);
    await request(app).post('/api/entries').set(bearer(token)).send({ body: 'a durable moment' });

    const list = await request(app).get('/api/entries').set(bearer(token));
    expect(list.status).toBe(200);
    expect(list.body.items).toHaveLength(1);
    expect(list.body.items[0].body).toBe('a durable moment');
  });

  it('requires authentication to capture (401)', async () => {
    const res = await request(app).post('/api/entries').send({ body: 'no token' });
    expect(res.status).toBe(401);
  });
});

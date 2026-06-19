import { beforeAll, afterAll, afterEach, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { startTestDb, stopTestDb, clearDb } from '../helpers/db';
import { registerUser, bearer } from '../helpers/api';

const app = createApp();

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearDb);

async function seed(token: string, isoDates: string[]): Promise<void> {
  for (const occurredAt of isoDates) {
    const res = await request(app)
      .post('/api/entries')
      .set(bearer(token))
      .send({ body: `moment ${occurredAt}`, occurredAt });
    expect(res.status).toBe(201);
  }
}

describe('timeline: order, pagination, deletion visibility (US3, FR-3.*)', () => {
  it('returns entries reverse-chronologically by occurredAt', async () => {
    const { token } = await registerUser(app);
    await seed(token, [
      '2025-06-01T10:00:00.000Z',
      '2025-06-03T10:00:00.000Z',
      '2025-06-02T10:00:00.000Z',
    ]);

    const res = await request(app).get('/api/entries').set(bearer(token));
    expect(res.status).toBe(200);
    const dates = res.body.items.map((entry: { occurredAt: string }) => entry.occurredAt);
    expect(dates).toEqual([
      '2025-06-03T10:00:00.000Z',
      '2025-06-02T10:00:00.000Z',
      '2025-06-01T10:00:00.000Z',
    ]);
  });

  it('cursor-paginates without overlap and ends with a null cursor (FR-3.4)', async () => {
    const { token } = await registerUser(app);
    await seed(token, [
      '2025-06-01T10:00:00.000Z',
      '2025-06-02T10:00:00.000Z',
      '2025-06-03T10:00:00.000Z',
    ]);

    const page1 = await request(app).get('/api/entries?limit=2').set(bearer(token));
    expect(page1.body.items).toHaveLength(2);
    expect(page1.body.nextCursor).toBeTruthy();

    const page2 = await request(app)
      .get(`/api/entries?limit=2&cursor=${encodeURIComponent(page1.body.nextCursor)}`)
      .set(bearer(token));
    expect(page2.body.items).toHaveLength(1);
    expect(page2.body.nextCursor).toBeNull();

    const ids = [...page1.body.items, ...page2.body.items].map((e: { id: string }) => e.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('excludes soft-deleted entries unless includeDeleted is set', async () => {
    const { token } = await registerUser(app);
    const created = await request(app)
      .post('/api/entries')
      .set(bearer(token))
      .send({ body: 'to be hidden' });
    await request(app).post('/api/entries').set(bearer(token)).send({ body: 'stays visible' });

    await request(app).delete(`/api/entries/${created.body.id}`).set(bearer(token));

    const visible = await request(app).get('/api/entries').set(bearer(token));
    expect(visible.body.items).toHaveLength(1);

    const all = await request(app).get('/api/entries?includeDeleted=true').set(bearer(token));
    expect(all.body.items).toHaveLength(2);
  });

  it('rejects an invalid cursor with 422', async () => {
    const { token } = await registerUser(app);
    const res = await request(app).get('/api/entries?cursor=not-a-cursor').set(bearer(token));
    expect(res.status).toBe(422);
  });
});

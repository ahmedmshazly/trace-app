import { beforeAll, afterAll, afterEach, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { startTestDb, stopTestDb, clearDb } from '../helpers/db';
import { registerUser, bearer } from '../helpers/api';

const app = createApp();

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearDb);

describe('curation: edit, backdate, soft-delete, restore (US4, FR-1.5/2.1/2.2/2.3)', () => {
  it('edits the body, refreshes updatedAt, and never mutates createdAt', async () => {
    const { token } = await registerUser(app);
    const created = await request(app)
      .post('/api/entries')
      .set(bearer(token))
      .send({ body: 'original body' });
    const { id, createdAt } = created.body;

    const patched = await request(app)
      .patch(`/api/entries/${id}`)
      .set(bearer(token))
      .send({ body: 'edited body', createdAt: '2000-01-01T00:00:00.000Z' });

    expect(patched.status).toBe(200);
    expect(patched.body.body).toBe('edited body');
    expect(patched.body.createdAt).toBe(createdAt); // immutable, forged value ignored
    expect(new Date(patched.body.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(createdAt).getTime(),
    );
  });

  it('backdates occurredAt and re-sorts the entry on the timeline', async () => {
    const { token } = await registerUser(app);
    const a = await request(app)
      .post('/api/entries')
      .set(bearer(token))
      .send({ body: 'A', occurredAt: '2025-06-01T10:00:00.000Z' });
    await request(app)
      .post('/api/entries')
      .set(bearer(token))
      .send({ body: 'B', occurredAt: '2025-06-02T10:00:00.000Z' });

    const before = await request(app).get('/api/entries').set(bearer(token));
    expect(before.body.items.map((e: { body: string }) => e.body)).toEqual(['B', 'A']);

    await request(app)
      .patch(`/api/entries/${a.body.id}`)
      .set(bearer(token))
      .send({ occurredAt: '2025-06-03T10:00:00.000Z' });

    const after = await request(app).get('/api/entries').set(bearer(token));
    expect(after.body.items.map((e: { body: string }) => e.body)).toEqual(['A', 'B']);
  });

  it('soft-deletes (hides) and restores an entry', async () => {
    const { token } = await registerUser(app);
    const created = await request(app)
      .post('/api/entries')
      .set(bearer(token))
      .send({ body: 'curate me' });
    const { id } = created.body;

    const del = await request(app).delete(`/api/entries/${id}`).set(bearer(token));
    expect(del.status).toBe(204);
    const hidden = await request(app).get('/api/entries').set(bearer(token));
    expect(hidden.body.items).toHaveLength(0);

    const restored = await request(app).post(`/api/entries/${id}/restore`).set(bearer(token));
    expect(restored.status).toBe(200);
    expect(restored.body.deleted).toBe(false);
    const visible = await request(app).get('/api/entries').set(bearer(token));
    expect(visible.body.items).toHaveLength(1);
  });

  it('rejects an empty edit body and a no-op patch (422)', async () => {
    const { token } = await registerUser(app);
    const created = await request(app)
      .post('/api/entries')
      .set(bearer(token))
      .send({ body: 'original' });

    const emptyBody = await request(app)
      .patch(`/api/entries/${created.body.id}`)
      .set(bearer(token))
      .send({ body: '   ' });
    expect(emptyBody.status).toBe(422);

    const noFields = await request(app)
      .patch(`/api/entries/${created.body.id}`)
      .set(bearer(token))
      .send({});
    expect(noFields.status).toBe(422);
  });

  it('returns 404 when curating a non-existent entry', async () => {
    const { token } = await registerUser(app);
    const res = await request(app)
      .patch('/api/entries/507f1f77bcf86cd799439011')
      .set(bearer(token))
      .send({ body: 'nope' });
    expect(res.status).toBe(404);
  });
});

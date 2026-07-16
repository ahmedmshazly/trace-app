import { beforeAll, afterAll, afterEach, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { startTestDb, stopTestDb, clearDb } from '../helpers/db';
import { registerUser, bearer } from '../helpers/api';

const app = createApp();

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearDb);

/**
 * The product's core promise: cross-user access is impossible (FR-040, NFR-4.3,
 * SC-004). A foreign resource is indistinguishable from a missing one (404).
 */
describe('per-user isolation (FR-040, SC-004)', () => {
  it("user B never sees user A's entries on the timeline", async () => {
    const a = await registerUser(app);
    const b = await registerUser(app);

    await request(app).post('/api/entries').set(bearer(a.token)).send({ body: "A's secret" });

    const bList = await request(app).get('/api/entries').set(bearer(b.token));
    expect(bList.status).toBe(200);
    expect(bList.body.items).toHaveLength(0);

    const aList = await request(app).get('/api/entries').set(bearer(a.token));
    expect(aList.body.items).toHaveLength(1);
  });

  it("user B cannot edit, delete, or restore user A's entry (404, not 403)", async () => {
    const a = await registerUser(app);
    const b = await registerUser(app);

    const created = await request(app)
      .post('/api/entries')
      .set(bearer(a.token))
      .send({ body: "A's entry" });
    const id = created.body.id;

    const patch = await request(app)
      .patch(`/api/entries/${id}`)
      .set(bearer(b.token))
      .send({ body: 'hijack' });
    expect(patch.status).toBe(404);

    const del = await request(app).delete(`/api/entries/${id}`).set(bearer(b.token));
    expect(del.status).toBe(404);

    const restore = await request(app).post(`/api/entries/${id}/restore`).set(bearer(b.token));
    expect(restore.status).toBe(404);

    // A's entry is untouched.
    const aList = await request(app).get('/api/entries').set(bearer(a.token));
    expect(aList.body.items).toHaveLength(1);
    expect(aList.body.items[0].body).toBe("A's entry");
  });

  it("user B's export/search/tags never include user A's corpus", async () => {
    const a = await registerUser(app);
    const b = await registerUser(app);

    await request(app)
      .post('/api/entries')
      .set(bearer(a.token))
      .send({ body: 'alpha coffee #private' });

    const exportRes = await request(app)
      .get('/api/entries/export?format=json')
      .set(bearer(b.token));
    expect(exportRes.status).toBe(200);
    expect(JSON.parse(exportRes.text)).toEqual([]);

    const search = await request(app).get('/api/entries?q=coffee').set(bearer(b.token));
    expect(search.status).toBe(200);
    expect(search.body.items).toHaveLength(0);

    const tagged = await request(app).get('/api/entries?tag=private').set(bearer(b.token));
    expect(tagged.status).toBe(200);
    expect(tagged.body.items).toHaveLength(0);

    const tags = await request(app).get('/api/entries/tags').set(bearer(b.token));
    expect(tags.status).toBe(200);
    expect(tags.body.tags).toEqual([]);
  });
});

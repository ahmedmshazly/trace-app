import { beforeAll, afterAll, afterEach, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { startTestDb, stopTestDb, clearDb } from '../helpers/db';
import { registerUser, bearer } from '../helpers/api';

const app = createApp();

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearDb);

async function seed(token: string, bodies: string[]): Promise<void> {
  for (const body of bodies) {
    const res = await request(app).post('/api/entries').set(bearer(token)).send({ body });
    expect(res.status).toBe(201);
  }
}

describe('timeline: server-side search (q) and tag filter', () => {
  it('filters by case-insensitive full-text match with q', async () => {
    const { token } = await registerUser(app);
    await seed(token, ['Coffee with Priya', 'long walk', 'fixed the COFFEE machine #home']);

    const res = await request(app).get('/api/entries?q=coffee').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    for (const item of res.body.items) {
      expect(item.body.toLowerCase()).toContain('coffee');
    }
  });

  it('filters by #tag without matching longer tags or substrings', async () => {
    const { token } = await registerUser(app);
    await seed(token, ['shipped it #work', 'planning #workout routine', 'no tags here']);

    const res = await request(app).get('/api/entries?tag=work').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].body).toBe('shipped it #work');
  });

  it('combines q with cursor pagination', async () => {
    const { token } = await registerUser(app);
    await seed(token, ['note alpha', 'note beta', 'note gamma', 'unrelated']);

    const page1 = await request(app).get('/api/entries?q=note&limit=2').set(bearer(token));
    expect(page1.body.items).toHaveLength(2);
    expect(page1.body.nextCursor).toBeTruthy();

    const page2 = await request(app)
      .get(`/api/entries?q=note&limit=2&cursor=${encodeURIComponent(page1.body.nextCursor)}`)
      .set(bearer(token));
    expect(page2.body.items).toHaveLength(1);
    expect(page2.body.nextCursor).toBeNull();
  });

  it('keeps search scoped to the requesting user', async () => {
    const a = await registerUser(app);
    const b = await registerUser(app);
    await seed(a.token, ['a-secret coffee']);
    await seed(b.token, ['b-secret coffee']);

    const res = await request(app).get('/api/entries?q=coffee').set(bearer(b.token));
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].body).toBe('b-secret coffee');
  });
});

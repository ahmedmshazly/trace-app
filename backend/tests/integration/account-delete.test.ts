import { beforeAll, afterAll, afterEach, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { startTestDb, stopTestDb, clearDb } from '../helpers/db';
import { registerUser, bearer } from '../helpers/api';

const app = createApp();

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearDb);

async function seed(token: string, count: number): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    const res = await request(app)
      .post('/api/entries')
      .set(bearer(token))
      .send({ body: `moment ${i}` });
    expect(res.status).toBe(201);
  }
}

describe('danger zone: bulk delete + account deletion', () => {
  it('hard-deletes all of the user’s entries', async () => {
    const { token } = await registerUser(app);
    await seed(token, 3);

    const del = await request(app).delete('/api/entries').set(bearer(token));
    expect(del.status).toBe(200);
    expect(del.body.deleted).toBe(3);

    const after = await request(app).get('/api/entries?includeDeleted=true').set(bearer(token));
    expect(after.body.items).toHaveLength(0);
  });

  it('deletes the account and all its data, leaving the token unusable', async () => {
    const { token } = await registerUser(app);
    await seed(token, 2);

    const del = await request(app).delete('/api/auth/me').set(bearer(token));
    expect(del.status).toBe(204);

    // The account is gone: /me (which loads the user) now reports 401.
    const me = await request(app).get('/api/auth/me').set(bearer(token));
    expect(me.status).toBe(401);

    // The JWT is stateless so it still authenticates until expiry, but the
    // account owns nothing anymore — the timeline is empty.
    const entries = await request(app).get('/api/entries').set(bearer(token));
    expect(entries.status).toBe(200);
    expect(entries.body.items).toHaveLength(0);
  });

  it('only deletes the requesting user’s data (isolation)', async () => {
    const a = await registerUser(app);
    const b = await registerUser(app);
    await seed(a.token, 2);
    await seed(b.token, 2);

    await request(app).delete('/api/entries').set(bearer(a.token));

    const bStill = await request(app).get('/api/entries').set(bearer(b.token));
    expect(bStill.body.items).toHaveLength(2);
  });
});

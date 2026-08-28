import { beforeAll, afterAll, afterEach, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { startTestDb, stopTestDb, clearDb } from '../helpers/db';

const app = createApp();

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearDb);

async function register(email: string, password = 'correct horse battery'): Promise<void> {
  const res = await request(app).post('/api/auth/register').send({ email, password });
  expect(res.status).toBe(201);
}

describe('auth: password reset (forgot / reset)', () => {
  it('issues a reset token for a known account and lets it set a new password', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'reset@example.com', password: 'original passphrase' });
    expect(reg.status).toBe(201);
    const priorToken = reg.body.token as string;

    const forgot = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'reset@example.com' });
    expect(forgot.status).toBe(200);
    expect(typeof forgot.body.message).toBe('string');
    // Non-production surfaces the token so the flow is testable without email.
    expect(typeof forgot.body.devToken).toBe('string');

    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: forgot.body.devToken, password: 'a brand new passphrase' });
    expect(reset.status).toBe(200);
    expect(typeof reset.body.token).toBe('string');
    expect(reset.body.user.email).toBe('reset@example.com');

    // Prior session invalidated (sessionEpoch bump, FR-003 / SC-002).
    const stale = await request(app)
      .get('/api/auth/me')
      .set('authorization', `Bearer ${priorToken}`);
    expect(stale.status).toBe(401);

    const fresh = await request(app)
      .get('/api/auth/me')
      .set('authorization', `Bearer ${reset.body.token}`);
    expect(fresh.status).toBe(200);

    // Old password rejected, new password accepted.
    const oldPw = await request(app)
      .post('/api/auth/login')
      .send({ email: 'reset@example.com', password: 'original passphrase' });
    expect(oldPw.status).toBe(401);

    const newPw = await request(app)
      .post('/api/auth/login')
      .send({ email: 'reset@example.com', password: 'a brand new passphrase' });
    expect(newPw.status).toBe(200);
  });

  it('does not reveal whether an account exists (no devToken for unknown email)', async () => {
    const known = await register('known@example.com').then(() =>
      request(app).post('/api/auth/forgot-password').send({ email: 'known@example.com' }),
    );
    const unknown = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'ghost@example.com' });

    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(known.body.message).toBe(unknown.body.message);
    expect(unknown.body.devToken).toBeUndefined();
  });

  it('rejects an invalid or already-used reset token with 422', async () => {
    await register('once@example.com');
    const forgot = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'once@example.com' });

    const first = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: forgot.body.devToken, password: 'fresh passphrase one' });
    expect(first.status).toBe(200);

    // The token is single-use: a second attempt fails.
    const second = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: forgot.body.devToken, password: 'fresh passphrase two' });
    expect(second.status).toBe(422);

    const garbage = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'not-a-real-token', password: 'whatever passphrase' });
    expect(garbage.status).toBe(422);
  });
});

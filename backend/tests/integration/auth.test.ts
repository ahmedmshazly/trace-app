import { beforeAll, afterAll, afterEach, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { startTestDb, stopTestDb, clearDb } from '../helpers/db';
import { bearer } from '../helpers/api';

const app = createApp();

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearDb);

describe('auth: register / login / me / logout (US2, FR-7.*)', () => {
  it('registers a new account, issues a token, and never returns the password hash', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@example.com', password: 'correct horse battery' });

    expect(res.status).toBe(201);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe('a@example.com');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('rejects a duplicate email (FR-002)', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dupe@example.com', password: 'correct horse battery' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dupe@example.com', password: 'another passphrase' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_IN_USE');
  });

  it('rejects registration with an invalid email or short password (422)', async () => {
    const badEmail = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'correct horse battery' });
    expect(badEmail.status).toBe(422);

    const shortPw = await request(app)
      .post('/api/auth/register')
      .send({ email: 'b@example.com', password: 'short' });
    expect(shortPw.status).toBe(422);
  });

  it('logs in with correct credentials and rejects wrong ones with an indistinct 401', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@example.com', password: 'correct horse battery' });

    const ok = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'correct horse battery' });
    expect(ok.status).toBe(200);
    expect(typeof ok.body.token).toBe('string');

    const wrongPw = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrong' });
    expect(wrongPw.status).toBe(401);
    expect(wrongPw.body.error.code).toBe('INVALID_CREDENTIALS');

    const unknown = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever else' });
    expect(unknown.status).toBe(401);
    expect(unknown.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns the current user with a valid token and 401 without one', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'me@example.com', password: 'correct horse battery' });

    const me = await request(app).get('/api/auth/me').set(bearer(reg.body.token));
    expect(me.status).toBe(200);
    expect(me.body.email).toBe('me@example.com');

    const anon = await request(app).get('/api/auth/me');
    expect(anon.status).toBe(401);
    expect(anon.body.error.code).toBe('UNAUTHORIZED');
  });

  it('logs out (stateless) returning 204 with a valid token', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'out@example.com', password: 'correct horse battery' });
    const res = await request(app).post('/api/auth/logout').set(bearer(reg.body.token));
    expect(res.status).toBe(204);
  });

  it('rejects a malformed Authorization header', async () => {
    const res = await request(app).get('/api/auth/me').set({ Authorization: 'Token abc' });
    expect(res.status).toBe(401);
  });
});

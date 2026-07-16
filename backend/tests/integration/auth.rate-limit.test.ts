import express from 'express';
import { beforeAll, afterAll, afterEach, describe, it, expect } from 'vitest';
import request from 'supertest';
import { MemoryStore } from 'express-rate-limit';
import { makeAuthRateLimiter } from '../../src/middleware/rate-limit';
import { errorHandler } from '../../src/middleware/error';
import { MongoRateLimitStore } from '../../src/lib/mongo-rate-limit-store';
import { startTestDb, stopTestDb, clearDb } from '../helpers/db';
import { RateLimitBucketModel } from '../../src/models/rate-limit-bucket';

/**
 * Verifies the rate-limit mechanism (FR-006, NFR-4.5) on an isolated app with a
 * fresh limiter, avoiding shared-counter flakiness with the auth suite.
 */
function buildApp(limit: number, store?: MemoryStore | MongoRateLimitStore) {
  const app = express();
  const limiter = makeAuthRateLimiter({
    limit,
    windowMs: 60_000,
    validate: false,
    ...(store ? { store } : { store: new MemoryStore() }),
  });
  app.post('/try', limiter, (_req, res) => res.status(200).json({ ok: true }));
  app.use(errorHandler);
  return app;
}

describe('auth rate limiting (FR-006, NFR-4.5)', () => {
  it('allows up to the limit then returns 429 with the standard envelope', async () => {
    const app = buildApp(3);

    for (let i = 0; i < 3; i += 1) {
      const ok = await request(app).post('/try').send({});
      expect(ok.status).toBe(200);
    }

    const limited = await request(app).post('/try').send({});
    expect(limited.status).toBe(429);
    expect(limited.body.error.code).toBe('RATE_LIMITED');
  });
});

describe('Mongo rate-limit store (shared across isolates)', () => {
  beforeAll(async () => {
    await startTestDb();
    await RateLimitBucketModel.init();
  });
  afterAll(stopTestDb);
  afterEach(clearDb);

  it('shares hit counts across two limiter instances (serverless parity)', async () => {
    const storeA = new MongoRateLimitStore();
    const storeB = new MongoRateLimitStore();
    storeA.init({ windowMs: 60_000 } as never);
    storeB.init({ windowMs: 60_000 } as never);

    const appA = buildApp(3, storeA);
    const appB = buildApp(3, storeB);

    // Two hits on isolate A, one on isolate B → third isolate should still see total 3.
    expect((await request(appA).post('/try').send({})).status).toBe(200);
    expect((await request(appA).post('/try').send({})).status).toBe(200);
    expect((await request(appB).post('/try').send({})).status).toBe(200);

    // Fourth hit (either isolate) must be rate-limited.
    const limited = await request(appB).post('/try').send({});
    expect(limited.status).toBe(429);
    expect(limited.body.error.code).toBe('RATE_LIMITED');
  });
});

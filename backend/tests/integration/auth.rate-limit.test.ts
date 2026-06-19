import express from 'express';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { makeAuthRateLimiter } from '../../src/middleware/rate-limit';
import { errorHandler } from '../../src/middleware/error';

/**
 * Verifies the rate-limit mechanism (FR-006, NFR-4.5) on an isolated app with a
 * fresh limiter, avoiding shared-counter flakiness with the auth suite.
 */
function buildApp(limit: number) {
  const app = express();
  const limiter = makeAuthRateLimiter({ limit, windowMs: 60_000, validate: false });
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

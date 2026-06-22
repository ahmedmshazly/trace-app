import { beforeAll, afterAll, afterEach, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { startTestDb, stopTestDb, clearDb } from '../helpers/db';
import { registerUser, bearer } from '../helpers/api';

const app = createApp();

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearDb);

describe('export: full record as JSON / Markdown', () => {
  it('exports JSON with an attachment header', async () => {
    const { token } = await registerUser(app);
    await request(app)
      .post('/api/entries')
      .set(bearer(token))
      .send({ body: 'exportable moment #keep', occurredAt: '2025-06-02T09:30:00.000Z' });

    const res = await request(app).get('/api/entries/export?format=json').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.headers['content-disposition']).toContain('attachment');
    const parsed = JSON.parse(res.text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].body).toBe('exportable moment #keep');
  });

  it('exports Markdown grouped by day', async () => {
    const { token } = await registerUser(app);
    await request(app)
      .post('/api/entries')
      .set(bearer(token))
      .send({ body: 'first', occurredAt: '2025-06-02T09:30:00.000Z' });

    const res = await request(app).get('/api/entries/export?format=markdown').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/markdown');
    expect(res.text).toContain('# Trace export');
    expect(res.text).toContain('## 2025-06-02');
    expect(res.text).toContain('first');
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/entries/export');
    expect(res.status).toBe(401);
  });
});

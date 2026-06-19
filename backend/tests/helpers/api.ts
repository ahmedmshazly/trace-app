import request from 'supertest';
import type { Express } from 'express';

export interface RegisteredUser {
  token: string;
  user: { id: string; email: string; createdAt: string };
}

let counter = 0;

/** Registers a fresh user and returns its token + public profile. */
export async function registerUser(
  app: Express,
  password = 'correct horse battery',
): Promise<RegisteredUser> {
  counter += 1;
  const email = `user${counter}@example.com`;
  const res = await request(app).post('/api/auth/register').send({ email, password });
  if (res.status !== 201) {
    throw new Error(`registerUser failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body as RegisteredUser;
}

/** Authorization header for a token. */
export function bearer(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

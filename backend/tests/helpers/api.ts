import request from 'supertest';
import type { Express } from 'express';

export interface RegisteredUser {
  token: string;
  user: { id: string; email: string; createdAt: string };
}

let counter = 0;

export interface RegisterOptions {
  password?: string;
  email?: string;
}

/** Registers a fresh user and returns its token + public profile. */
export async function registerUser(
  app: Express,
  passwordOrOptions: string | RegisterOptions = 'correct horse battery',
): Promise<RegisteredUser> {
  counter += 1;
  const options =
    typeof passwordOrOptions === 'string' ? { password: passwordOrOptions } : passwordOrOptions;
  const password = options.password ?? 'correct horse battery';
  const email = options.email ?? `user${counter}@example.com`;
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

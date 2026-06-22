import { randomBytes, createHash } from 'node:crypto';

/**
 * Password-reset tokens: a high-entropy random value is handed to the user
 * (over a side channel — email in production), while only its SHA-256 hash is
 * persisted. Verification re-hashes the presented token and matches the hash.
 */
export function generateResetToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString('hex');
  return { raw, hash: hashResetToken(raw) };
}

export function hashResetToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/** Reset links are valid for 30 minutes. */
export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

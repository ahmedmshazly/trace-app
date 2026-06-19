import bcrypt from 'bcryptjs';

/**
 * Password hashing (Constitution V — salted hashes only; ADR-0003).
 * Uses the bcrypt algorithm via `bcryptjs` (pure JS) so builds need no native
 * toolchain in any environment. Cost 12 is a sensible adaptive default.
 */
const BCRYPT_COST = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export function verifyPassword(plain: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plain, passwordHash);
}

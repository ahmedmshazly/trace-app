import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../../src/lib/token';

describe('jwt token', () => {
  it('round-trips the subject (user id)', () => {
    const token = signToken('507f1f77bcf86cd799439011');
    expect(verifyToken(token).sub).toBe('507f1f77bcf86cd799439011');
  });

  it('throws on a malformed token', () => {
    expect(() => verifyToken('not-a-jwt')).toThrow();
  });

  it('throws on a token signed with a different secret', () => {
    // A token with a valid shape but a foreign signature must not verify.
    const foreign = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ4In0.invalidsignature';
    expect(() => verifyToken(foreign)).toThrow();
  });
});

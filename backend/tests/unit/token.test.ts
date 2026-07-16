import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../../src/lib/token';

describe('jwt token', () => {
  it('round-trips the subject (user id) and session epoch', () => {
    const token = signToken('507f1f77bcf86cd799439011', 3);
    const payload = verifyToken(token);
    expect(payload.sub).toBe('507f1f77bcf86cd799439011');
    expect(payload.sev).toBe(3);
  });

  it('defaults missing sev claim to 0 for legacy tokens', () => {
    const token = signToken('507f1f77bcf86cd799439011');
    expect(verifyToken(token).sev).toBe(0);
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

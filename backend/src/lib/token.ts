import jwt from 'jsonwebtoken';
import { config } from '../config';

/**
 * Stateless JWT access tokens (ADR-0003, research R-01). The subject claim
 * carries the user id; `sev` is the sessionEpoch at issue time so middleware
 * can revoke prior sessions by bumping the user's epoch (feature 004 R-003).
 */
export interface TokenPayload {
  sub: string;
  sev: number;
}

export function signToken(userId: string, sessionEpoch = 0): string {
  const options: jwt.SignOptions = {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign({ sub: userId, sev: sessionEpoch }, config.jwtSecret, options);
}

/** Throws if the token is missing/expired/tampered or lacks a usable subject. */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, config.jwtSecret);
  if (typeof decoded === 'object' && decoded !== null && typeof decoded.sub === 'string') {
    const sev = typeof decoded.sev === 'number' && Number.isFinite(decoded.sev) ? decoded.sev : 0;
    return { sub: decoded.sub, sev };
  }
  throw new jwt.JsonWebTokenError('Token is missing a valid subject');
}

import jwt from 'jsonwebtoken';
import { config } from '../config';

/**
 * Stateless JWT access tokens (ADR-0003, research R-01). The subject claim
 * carries the user id; middleware verifies the token and attaches `req.userId`.
 */
export interface TokenPayload {
  sub: string;
}

export function signToken(userId: string): string {
  const options: jwt.SignOptions = {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign({ sub: userId }, config.jwtSecret, options);
}

/** Throws if the token is missing/expired/tampered or lacks a usable subject. */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, config.jwtSecret);
  if (typeof decoded === 'object' && decoded !== null && typeof decoded.sub === 'string') {
    return { sub: decoded.sub };
  }
  throw new jwt.JsonWebTokenError('Token is missing a valid subject');
}

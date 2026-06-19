import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/token';
import { UnauthorizedError } from '../lib/errors';

/**
 * Resolves the bearer token to `req.userId` when present. It does NOT reject
 * unauthenticated requests — `requireUser` does that. This split lets a route be
 * optionally authenticated if ever needed, while keeping rejection in one place.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  if (!header) {
    next();
    return;
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    next(new UnauthorizedError('Authorization header must be "Bearer <token>"'));
    return;
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    // Do not leak why verification failed (expired vs tampered).
    next(new UnauthorizedError());
  }
}

/** Guard for protected routes: 401 unless a verified `req.userId` is present. */
export function requireUser(req: Request, _res: Response, next: NextFunction): void {
  if (!req.userId) {
    next(new UnauthorizedError());
    return;
  }
  next();
}

/**
 * Type-safe accessor for the authenticated user id inside a protected handler.
 * Throws (rather than returning undefined) as a defense in depth if reached
 * without `requireUser`.
 */
export function getUserId(req: Request): string {
  if (!req.userId) {
    throw new UnauthorizedError();
  }
  return req.userId;
}

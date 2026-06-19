import rateLimit, { type Options } from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { RateLimitError } from '../lib/errors';

/**
 * Builds a rate limiter that routes rejections through the central error handler
 * so the response uses the standard error envelope (FR-006, NFR-4.5). Exported as
 * a factory so suites can construct an isolated limiter without shared state.
 */
export function makeAuthRateLimiter(overrides: Partial<Options> = {}) {
  return rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, _res: Response, next: NextFunction) => {
      next(new RateLimitError());
    },
    ...overrides,
  });
}

/**
 * The limiter mounted on auth endpoints. Skipped under tests so unrelated auth
 * integration tests are deterministic and free of shared-counter flakiness; the
 * mechanism itself is verified with a dedicated isolated limiter.
 */
export const authRateLimiter = makeAuthRateLimiter({ skip: () => config.isTest });

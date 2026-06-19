/**
 * Request augmentations. `userId` is set by the auth middleware after verifying
 * the bearer token; `id` is a per-request correlation id for structured logs.
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      id?: string;
    }
  }
}

export {};

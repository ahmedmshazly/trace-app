/**
 * Domain error types. Services throw these; the central error handler
 * (src/middleware/error.ts) maps them to the documented error envelope
 * (docs/02-architecture/api-design.md). HTTP status codes are an attribute of
 * the error, so routes never hand-roll status codes for domain failures.
 */
export type ErrorDetails = Record<string, unknown>;

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: ErrorDetails | undefined;
  /** Expected, client-facing errors are safe to surface; unexpected ones are masked. */
  readonly expected: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    options: { details?: ErrorDetails; expected?: boolean } = {},
  ) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = options.details;
    this.expected = options.expected ?? true;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Request failed validation', details?: ErrorDetails) {
    super(422, 'VALIDATION_ERROR', message, { details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Missing or invalid authentication') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = 'Email or password is incorrect') {
    super(401, 'INVALID_CREDENTIALS', message);
  }
}

export class EmailInUseError extends AppError {
  constructor(message = 'Email is already registered') {
    super(409, 'EMAIL_IN_USE', message);
  }
}

/**
 * Used for "not found OR not owned by the caller". We never reveal that a
 * resource the caller does not own exists (isolation nuance, api-design.md).
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many attempts, please try again later') {
    super(429, 'RATE_LIMITED', message);
  }
}

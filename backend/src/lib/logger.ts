import pino from 'pino';
import { config } from '../config';

/**
 * Structured application logger (Constitution VI).
 *
 * INVARIANT: never log user entry content or secrets. Log identifiers, status,
 * timings, and correlation ids — never `body`, passwords, tokens, or `MONGODB_URI`.
 * Pretty transport is used only outside production for human-readable local logs.
 */
export const logger = pino({
  level: config.logLevel,
  redact: {
    paths: ['req.headers.authorization', 'password', 'passwordHash', 'token', 'jwtSecret'],
    remove: true,
  },
  // Pretty transport only for local development. Avoided under tests so no
  // worker thread lingers, and in production where logs are consumed as JSON.
  ...(config.isProduction || config.isTest
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
        },
      }),
});

export type Logger = typeof logger;

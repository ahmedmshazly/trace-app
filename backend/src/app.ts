import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import { requestContext } from './middleware/request-context';
import { authenticate } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/error';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import entryRoutes from './routes/entry.routes';

/**
 * Builds the Express application (no network listen) so tests can mount it with
 * Supertest and production can wire its own lifecycle. Layering: security
 * headers → CORS → body parsing → request context → auth → routes → 404 → errors.
 */
export function createApp(): Express {
  const app = express();
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(cors({ origin: config.allowedOrigins, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.use(requestContext);
  app.use(authenticate);

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/entries', entryRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

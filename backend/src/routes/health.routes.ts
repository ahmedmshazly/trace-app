import { Router } from 'express';
import { isDbConnected } from '../lib/db';

/**
 * Liveness/readiness probe (NFR-3.5, Constitution VI). Reports degraded (503)
 * when the datastore is unreachable so platforms can gate traffic.
 */
const router = Router();

router.get('/', (_req, res) => {
  const dbConnected = isDbConnected();
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    uptime: process.uptime(),
    db: dbConnected ? 'connected' : 'disconnected',
  });
});

export default router;

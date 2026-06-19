import type { Server } from 'node:http';
import { config } from './config';
import { connectDb, disconnectDb } from './lib/db';
import { logger } from './lib/logger';
import { createApp } from './app';

async function main(): Promise<void> {
  await connectDb();
  const app = createApp();

  const server: Server = app.listen(config.port, () => {
    logger.info({ port: config.port, env: config.nodeEnv }, 'Trace API listening');
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'Shutting down');
    server.close(() => {
      void disconnectDb().finally(() => process.exit(0));
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err: unknown) => {
  logger.fatal({ err }, 'Failed to start the server');
  process.exit(1);
});

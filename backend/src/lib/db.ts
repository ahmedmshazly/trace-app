import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from './logger';

/**
 * MongoDB connection lifecycle. The URI is injectable so tests can point at an
 * ephemeral in-memory server while production reads it from validated config.
 */
export async function connectDb(uri: string = config.mongodbUri): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });
  // Never log the URI (it may contain credentials) — log only the database name.
  logger.info({ db: conn.connection.name }, 'MongoDB connected');
  return conn;
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

/** True when a live connection exists (used by the health probe). */
export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

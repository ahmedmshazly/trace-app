import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from './logger';

/**
 * MongoDB connection lifecycle. The URI is injectable so tests can point at an
 * ephemeral in-memory server while production reads it from validated config.
 */
export async function connectDb(uri: string = config.mongodbUri): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  mongoose.set('strictQuery', true);
  const isServerless = Boolean(process.env.VERCEL);
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: isServerless ? 5_000 : 10_000,
    maxPoolSize: isServerless ? 1 : 10,
  });
  // Never log the URI (it may contain credentials); log only the database name.
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

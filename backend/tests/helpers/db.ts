import { readFileSync } from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import { connectDb, disconnectDb } from '../../src/lib/db';
import { UserModel } from '../../src/models/user';
import { EntryModel } from '../../src/models/entry';
import { PasswordResetTokenModel } from '../../src/models/password-reset-token';
import { RateLimitBucketModel } from '../../src/models/rate-limit-bucket';

const URI_FILE = path.join(process.cwd(), 'tests', '.mongo-uri');

function sharedUri(): string {
  try {
    return readFileSync(URI_FILE, 'utf8').trim();
  } catch {
    throw new Error('Test Mongo URI missing: ensure vitest globalSetup started MongoMemoryServer');
  }
}

/** Connects to the shared in-memory Mongo and builds model indexes. */
export async function startTestDb(): Promise<void> {
  const uri = sharedUri();
  if (mongoose.connection.readyState !== 1) {
    await connectDb(uri);
  }
  await Promise.all([
    UserModel.init(),
    EntryModel.init(),
    PasswordResetTokenModel.init(),
    RateLimitBucketModel.init(),
  ]);
}

/**
 * Connection lifecycle is owned by globalSetup, so per-file teardown must not
 * disconnect, or later files would race a dead connection.
 */
export async function stopTestDb(): Promise<void> {
  /* no-op */
}

/** Empties all collections between tests for hermetic, order-independent runs. */
export async function clearDb(): Promise<void> {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

/** Used only if a suite needs an explicit disconnect (e.g. isolated scripts). */
export async function forceDisconnectTestDb(): Promise<void> {
  await disconnectDb();
}

import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { MongoMemoryServer } from 'mongodb-memory-server';

const URI_FILE = path.join(process.cwd(), 'tests', '.mongo-uri');

/**
 * Boots a single MongoMemoryServer for the whole Vitest run. The URI is written
 * to a file so every worker/file can connect to the same instance (avoids
 * per-file 10s+ cold starts and hook timeouts).
 */
export default async function globalSetup(): Promise<() => Promise<void>> {
  const mongo = await MongoMemoryServer.create();
  writeFileSync(URI_FILE, mongo.getUri(), 'utf8');

  return async () => {
    await mongo.stop();
    try {
      unlinkSync(URI_FILE);
    } catch {
      /* already removed */
    }
  };
}

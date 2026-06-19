import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { connectDb, disconnectDb } from '../../src/lib/db';
import { UserModel } from '../../src/models/user';
import { EntryModel } from '../../src/models/entry';

let mongo: MongoMemoryServer | undefined;

/** Boots an ephemeral MongoDB and builds model indexes (for unique/sort tests). */
export async function startTestDb(): Promise<void> {
  mongo = await MongoMemoryServer.create();
  await connectDb(mongo.getUri());
  await Promise.all([UserModel.init(), EntryModel.init()]);
}

export async function stopTestDb(): Promise<void> {
  await disconnectDb();
  if (mongo) {
    await mongo.stop();
    mongo = undefined;
  }
}

/** Empties all collections between tests for hermetic, order-independent runs. */
export async function clearDb(): Promise<void> {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

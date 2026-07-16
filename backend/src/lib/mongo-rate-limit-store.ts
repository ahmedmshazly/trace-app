import type { Options, Store, IncrementResponse, ClientRateLimitInfo } from 'express-rate-limit';
import { RateLimitBucketModel } from '../models/rate-limit-bucket';

/**
 * express-rate-limit Store backed by MongoDB so counters survive across Vercel
 * serverless isolates (NFR-4.5 / audit FR-001).
 */
export class MongoRateLimitStore implements Store {
  readonly localKeys = false;
  readonly prefix = 'rl:';

  private windowMs = 15 * 60 * 1000;

  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  private prefixed(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const doc = await RateLimitBucketModel.findOne({ key: this.prefixed(key) }).lean();
    if (!doc || doc.resetAt.getTime() <= Date.now()) {
      return undefined;
    }
    return { totalHits: doc.hits, resetTime: doc.resetAt };
  }

  async increment(key: string): Promise<IncrementResponse> {
    const now = Date.now();
    const fullKey = this.prefixed(key);
    const existing = await RateLimitBucketModel.findOne({ key: fullKey });

    if (!existing || existing.resetAt.getTime() <= now) {
      const resetAt = new Date(now + this.windowMs);
      await RateLimitBucketModel.findOneAndUpdate(
        { key: fullKey },
        { $set: { hits: 1, resetAt } },
        { upsert: true, returnDocument: 'after' },
      );
      return { totalHits: 1, resetTime: resetAt };
    }

    const updated = await RateLimitBucketModel.findOneAndUpdate(
      { key: fullKey, resetAt: { $gt: new Date(now) } },
      { $inc: { hits: 1 } },
      { returnDocument: 'after' },
    );

    if (!updated) {
      // Window flipped between read and write — start a fresh bucket.
      const resetAt = new Date(now + this.windowMs);
      await RateLimitBucketModel.findOneAndUpdate(
        { key: fullKey },
        { $set: { hits: 1, resetAt } },
        { upsert: true, returnDocument: 'after' },
      );
      return { totalHits: 1, resetTime: resetAt };
    }

    return { totalHits: updated.hits, resetTime: updated.resetAt };
  }

  async decrement(key: string): Promise<void> {
    await RateLimitBucketModel.updateOne(
      { key: this.prefixed(key), hits: { $gt: 0 } },
      { $inc: { hits: -1 } },
    );
  }

  async resetKey(key: string): Promise<void> {
    await RateLimitBucketModel.deleteOne({ key: this.prefixed(key) });
  }

  async resetAll(): Promise<void> {
    await RateLimitBucketModel.deleteMany({});
  }
}

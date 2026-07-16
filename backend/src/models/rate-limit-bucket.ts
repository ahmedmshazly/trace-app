import { Schema, model, type HydratedDocument } from 'mongoose';

/**
 * Shared hit counter for auth rate limiting across serverless isolates.
 * `resetAt` doubles as the Mongo TTL expiry so stale buckets self-clean.
 */
export interface RateLimitBucket {
  key: string;
  hits: number;
  resetAt: Date;
}

export type RateLimitBucketDocument = HydratedDocument<RateLimitBucket>;

const rateLimitBucketSchema = new Schema<RateLimitBucket>(
  {
    key: { type: String, required: true, unique: true },
    hits: { type: Number, required: true, default: 0 },
    resetAt: { type: Date, required: true },
  },
  { timestamps: false },
);

rateLimitBucketSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimitBucketModel = model<RateLimitBucket>(
  'RateLimitBucket',
  rateLimitBucketSchema,
);

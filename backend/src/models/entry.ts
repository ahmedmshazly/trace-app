import { Schema, model, type Types, type HydratedDocument } from 'mongoose';

/**
 * A single timestamped moment, owned by exactly one User.
 * See specs/001-foundation-and-capture/data-model.md for the canonical schema.
 */
export interface Entry {
  userId: Types.ObjectId;
  body: string;
  /** When the moment happened — the primary analysis axis; editable (backdating). */
  occurredAt: Date;
  /** Commit instant — set once on creation, never mutated (Constitution II). */
  createdAt: Date;
  updatedAt: Date;
  /** Soft-delete flag; hidden when true. No hard delete in V1 (ADR-0004). */
  deleted: boolean;
  /** Reserved for future capture methods (e.g. "voice"); unused in V1. */
  source: string;
}

export type EntryDocument = HydratedDocument<Entry>;

const entrySchema = new Schema<Entry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      // Defense in depth: the service also trims and rejects empty bodies (FR-1.x).
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'body must not be empty',
      },
    },
    occurredAt: { type: Date, required: true, default: () => new Date() },
    deleted: { type: Boolean, required: true, default: false },
    source: { type: String, required: true, default: 'manual' },
  },
  {
    // timestamps manages createdAt (set once) and updatedAt (refreshed on save).
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.userId;
        return ret;
      },
    },
  },
);

// Serves the reverse-chronological, day-grouped, cursor-paginated timeline (R-06).
entrySchema.index({ userId: 1, occurredAt: -1, _id: -1 });

// Full-text search over body (feature 002); equality on userId still filters first.
entrySchema.index({ body: 'text' });

export const EntryModel = model<Entry>('Entry', entrySchema);

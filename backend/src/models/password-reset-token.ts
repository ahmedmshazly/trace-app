import { Schema, model, type Types, type HydratedDocument } from 'mongoose';

/**
 * A single-use password-reset grant. We store only the SHA-256 hash of the raw
 * token (never the token itself), so a database leak cannot be used to reset
 * accounts. Mongo's TTL index expires documents at `expiresAt`.
 */
export interface PasswordResetToken {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export type PasswordResetTokenDocument = HydratedDocument<PasswordResetToken>;

const passwordResetTokenSchema = new Schema<PasswordResetToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// TTL: Mongo removes the document once `expiresAt` passes.
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetTokenModel = model<PasswordResetToken>(
  'PasswordResetToken',
  passwordResetTokenSchema,
);

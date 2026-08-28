import { Schema, model, type Types, type HydratedDocument } from 'mongoose';

/** Persisted shape of a User (an account holder who owns a private corpus). */
export interface User {
  email: string;
  /** bcrypt salted hash. Never plaintext, never serialized (Constitution V). */
  passwordHash: string;
  /**
   * Bumped on password reset (and similar revoke events). Embedded in JWTs as
   * `sev` so prior sessions can be invalidated without a denylist (R-003).
   */
  sessionEpoch: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMethods {
  _id: Types.ObjectId;
}

export type UserDocument = HydratedDocument<User>;

const userSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // `select: false` keeps the hash out of query results unless explicitly requested.
    passwordHash: { type: String, required: true, select: false },
    sessionEpoch: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.passwordHash;
        delete ret.sessionEpoch;
        return ret;
      },
    },
  },
);

export const UserModel = model<User>('User', userSchema);

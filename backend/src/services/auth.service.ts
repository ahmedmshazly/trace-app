import { UserModel, type UserDocument } from '../models/user';
import { EntryModel } from '../models/entry';
import { PasswordResetTokenModel } from '../models/password-reset-token';
import { hashPassword, verifyPassword } from '../lib/password';
import { signToken } from '../lib/token';
import { generateResetToken, hashResetToken, RESET_TOKEN_TTL_MS } from '../lib/reset-token';
import { sendPasswordResetEmail } from '../lib/mailer';
import { config } from '../config';
import {
  EmailInUseError,
  InvalidCredentialsError,
  UnauthorizedError,
  ValidationError,
} from '../lib/errors';

export interface PublicUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResult {
  token: string;
  user: PublicUser;
}

function toPublicUser(doc: UserDocument): PublicUser {
  return {
    id: doc._id.toString(),
    email: doc.email,
    createdAt: doc.createdAt.toISOString(),
  };
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === 11000;
}

/**
 * Registers a new account and issues a session token.
 * @throws EmailInUseError when the email is already registered (FR-002).
 */
export async function register(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (await UserModel.exists({ email: normalizedEmail })) {
    throw new EmailInUseError();
  }

  const passwordHash = await hashPassword(password);

  let user: UserDocument;
  try {
    user = await UserModel.create({ email: normalizedEmail, passwordHash });
  } catch (err) {
    // The unique index is the source of truth under concurrent registrations.
    if (isDuplicateKeyError(err)) {
      throw new EmailInUseError();
    }
    throw err;
  }

  return {
    token: signToken(user._id.toString(), user.sessionEpoch),
    user: toPublicUser(user),
  };
}

/**
 * Authenticates a user and issues a session token.
 * @throws InvalidCredentialsError on unknown email or wrong password (no
 *   distinction is made, to avoid revealing which emails are registered).
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  // passwordHash is select:false, so request it explicitly for verification.
  const user = await UserModel.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    throw new InvalidCredentialsError();
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new InvalidCredentialsError();
  }

  return {
    token: signToken(user._id.toString(), user.sessionEpoch),
    user: toPublicUser(user),
  };
}

/** Returns the authenticated user's public profile. */
export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new UnauthorizedError();
  }
  return toPublicUser(user);
}

/**
 * Begins a password reset. Returns the raw token only when an account exists;
 * the caller (route) must respond identically either way so the endpoint never
 * reveals whether an email is registered (no account enumeration, FR-7.*).
 * Sends the reset link via the configured mailer; surfaces the raw token to the
 * caller only for non-production log-transport testing.
 */
export async function requestPasswordReset(email: string): Promise<{ rawToken: string | null }> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await UserModel.findOne({ email: normalizedEmail });
  if (!user) {
    return { rawToken: null };
  }

  // One outstanding grant per user: drop any prior tokens before issuing a new one.
  await PasswordResetTokenModel.deleteMany({ userId: user._id });

  const { raw, hash } = generateResetToken();
  await PasswordResetTokenModel.create({
    userId: user._id,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });

  const resetUrl = `${config.appOrigin}/?reset-token=${encodeURIComponent(raw)}`;
  await sendPasswordResetEmail({ to: user.email, resetUrl });

  return { rawToken: raw };
}

/**
 * Completes a password reset: atomically claims the (single-use) token, sets
 * the new password, and issues a fresh session (auto-login).
 * @throws ValidationError when the token is unknown or expired.
 */
export async function resetPassword(rawToken: string, newPassword: string): Promise<AuthResult> {
  const tokenHash = hashResetToken(rawToken);
  const grant = await PasswordResetTokenModel.findOneAndDelete({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });
  if (!grant) {
    throw new ValidationError('Invalid or expired reset token');
  }

  const user = await UserModel.findById(grant.userId).select('+passwordHash');
  if (!user) {
    await PasswordResetTokenModel.deleteMany({ userId: grant.userId });
    throw new ValidationError('Invalid or expired reset token');
  }

  user.passwordHash = await hashPassword(newPassword);
  // Bump epoch so any JWT issued before this reset is rejected (FR-003 / R-003).
  user.sessionEpoch = (user.sessionEpoch ?? 0) + 1;
  await user.save();
  await PasswordResetTokenModel.deleteMany({ userId: user._id });

  return {
    token: signToken(user._id.toString(), user.sessionEpoch),
    user: toPublicUser(user),
  };
}

/**
 * Verifies the account password for step-up actions (danger-zone deletes).
 * @throws InvalidCredentialsError when the password does not match.
 */
export async function verifyUserPassword(userId: string, password: string): Promise<void> {
  const user = await UserModel.findById(userId).select('+passwordHash');
  if (!user) {
    throw new UnauthorizedError();
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new InvalidCredentialsError();
  }
}

/**
 * Permanently deletes the account and everything it owns (entries + reset
 * tokens). Irreversible, so it is exposed only behind password step-up + client confirm.
 */
export async function deleteAccount(userId: string): Promise<void> {
  await EntryModel.deleteMany({ userId });
  await PasswordResetTokenModel.deleteMany({ userId });
  await UserModel.deleteOne({ _id: userId });
}

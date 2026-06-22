import { UserModel, type UserDocument } from '../models/user';
import { EntryModel } from '../models/entry';
import { PasswordResetTokenModel } from '../models/password-reset-token';
import { hashPassword, verifyPassword } from '../lib/password';
import { signToken } from '../lib/token';
import { generateResetToken, hashResetToken, RESET_TOKEN_TTL_MS } from '../lib/reset-token';
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

  return { token: signToken(user._id.toString()), user: toPublicUser(user) };
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

  return { token: signToken(user._id.toString()), user: toPublicUser(user) };
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
 * In production the token travels by email; with no mailer configured it is
 * surfaced to the caller for non-production/testing use only.
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

  return { rawToken: raw };
}

/**
 * Completes a password reset: validates the (single-use) token, sets the new
 * password, invalidates the token, and issues a fresh session (auto-login).
 * @throws ValidationError when the token is unknown or expired.
 */
export async function resetPassword(rawToken: string, newPassword: string): Promise<AuthResult> {
  const tokenHash = hashResetToken(rawToken);
  const grant = await PasswordResetTokenModel.findOne({ tokenHash });
  if (!grant || grant.expiresAt.getTime() <= Date.now()) {
    if (grant) await PasswordResetTokenModel.deleteOne({ _id: grant._id });
    throw new ValidationError('Invalid or expired reset token');
  }

  const user = await UserModel.findById(grant.userId);
  if (!user) {
    await PasswordResetTokenModel.deleteMany({ userId: grant.userId });
    throw new ValidationError('Invalid or expired reset token');
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  await PasswordResetTokenModel.deleteMany({ userId: user._id });

  return { token: signToken(user._id.toString()), user: toPublicUser(user) };
}

/**
 * Permanently deletes the account and everything it owns (entries + reset
 * tokens). Irreversible — exposed only behind the client's typed confirmation.
 */
export async function deleteAccount(userId: string): Promise<void> {
  await EntryModel.deleteMany({ userId });
  await PasswordResetTokenModel.deleteMany({ userId });
  await UserModel.deleteOne({ _id: userId });
}

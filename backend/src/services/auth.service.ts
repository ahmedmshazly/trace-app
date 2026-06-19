import { UserModel, type UserDocument } from '../models/user';
import { hashPassword, verifyPassword } from '../lib/password';
import { signToken } from '../lib/token';
import { EmailInUseError, InvalidCredentialsError, UnauthorizedError } from '../lib/errors';

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

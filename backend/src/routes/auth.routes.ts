import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config';
import { asyncHandler } from '../lib/async-handler';
import { authRateLimiter } from '../middleware/rate-limit';
import { requireUser, getUserId } from '../middleware/auth';
import {
  register,
  login,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  deleteAccount,
} from '../services/auth.service';

// Registration enforces the password policy; login only checks presence so a
// wrong (possibly short) password still returns 401, never a 422 that would leak
// the policy or distinguish accounts.
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'token is required'),
  password: z.string().min(8, 'password must be at least 8 characters'),
});

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = registerSchema.parse(req.body);
    const result = await register(email, password);
    res.status(201).json(result);
  }),
);

router.post(
  '/login',
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const result = await login(email, password);
    res.status(200).json(result);
  }),
);

// Always responds the same way whether or not the email is registered, so it
// never reveals which accounts exist. With no mailer configured, the reset
// token is returned only in non-production to make the flow usable/testable.
router.post(
  '/forgot-password',
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    const { rawToken } = await requestPasswordReset(email);
    const body: { message: string; devToken?: string } = {
      message: 'If an account exists for that address, a reset link is on its way.',
    };
    if (!config.isProduction && rawToken) {
      body.devToken = rawToken;
    }
    res.status(200).json(body);
  }),
);

router.post(
  '/reset-password',
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const result = await resetPassword(token, password);
    res.status(200).json(result);
  }),
);

// Stateless JWT: logout is the client discarding its token. The endpoint exists
// for symmetry and future refresh-token revocation (research R-01).
router.post('/logout', requireUser, (_req, res) => {
  res.status(204).end();
});

router.get(
  '/me',
  requireUser,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(getUserId(req));
    res.status(200).json(user);
  }),
);

// Permanently deletes the account and all its data (irreversible).
router.delete(
  '/me',
  requireUser,
  asyncHandler(async (req, res) => {
    await deleteAccount(getUserId(req));
    res.status(204).end();
  }),
);

export default router;

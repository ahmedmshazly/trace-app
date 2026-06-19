import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/async-handler';
import { authRateLimiter } from '../middleware/rate-limit';
import { requireUser, getUserId } from '../middleware/auth';
import { register, login, getCurrentUser } from '../services/auth.service';

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

export default router;

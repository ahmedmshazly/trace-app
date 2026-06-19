import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/async-handler';
import { requireUser, getUserId } from '../middleware/auth';
import {
  createEntry,
  listEntries,
  updateEntry,
  softDeleteEntry,
  restoreEntry,
} from '../services/entry.service';

const createEntrySchema = z.object({
  body: z.string().min(1, 'body must not be empty'),
  occurredAt: z.string().datetime({ offset: true }).optional(),
});

const updateEntrySchema = z
  .object({
    body: z.string().min(1, 'body must not be empty').optional(),
    occurredAt: z.string().datetime({ offset: true }).optional(),
  })
  .refine((data) => data.body !== undefined || data.occurredAt !== undefined, {
    message: 'Provide body and/or occurredAt',
  });

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().min(1).optional(),
  includeDeleted: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

const router = Router();

// Every entry operation is scoped to the authenticated user.
router.use(requireUser);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = createEntrySchema.parse(req.body);
    const entry = await createEntry(getUserId(req), {
      body: input.body,
      ...(input.occurredAt ? { occurredAt: new Date(input.occurredAt) } : {}),
    });
    res.status(201).json(entry);
  }),
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = listQuerySchema.parse(req.query);
    const page = await listEntries(getUserId(req), {
      ...(query.limit !== undefined ? { limit: query.limit } : {}),
      ...(query.cursor !== undefined ? { cursor: query.cursor } : {}),
      includeDeleted: query.includeDeleted,
    });
    res.status(200).json(page);
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = updateEntrySchema.parse(req.body);
    const entry = await updateEntry(getUserId(req), String(req.params.id ?? ''), {
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.occurredAt !== undefined ? { occurredAt: new Date(input.occurredAt) } : {}),
    });
    res.status(200).json(entry);
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await softDeleteEntry(getUserId(req), String(req.params.id ?? ''));
    res.status(204).end();
  }),
);

router.post(
  '/:id/restore',
  asyncHandler(async (req, res) => {
    const entry = await restoreEntry(getUserId(req), String(req.params.id ?? ''));
    res.status(200).json(entry);
  }),
);

export default router;

import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/async-handler';
import { requireUser, getUserId } from '../middleware/auth';
import {
  createEntry,
  listEntries,
  listAllEntries,
  updateEntry,
  softDeleteEntry,
  restoreEntry,
  deleteAllEntries,
  type EntryDTO,
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
  q: z.string().trim().min(1).max(200).optional(),
  tag: z.string().trim().min(1).max(80).optional(),
  includeDeleted: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

const exportQuerySchema = z.object({
  format: z.enum(['markdown', 'json']).default('markdown'),
  includeDeleted: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

function buildMarkdown(entries: EntryDTO[]): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const lines = ['# Trace export', '', `_${entries.length} moments · exported ${stamp}_`, ''];
  let currentDay = '';
  for (const entry of entries) {
    const day = entry.occurredAt.slice(0, 10);
    if (day !== currentDay) {
      currentDay = day;
      lines.push(`## ${day}`, '');
    }
    const time = entry.occurredAt.slice(11, 16);
    lines.push(`- **${time}** — ${entry.body.replace(/\r?\n/g, ' ')}`);
  }
  lines.push('');
  return lines.join('\n');
}

const router = Router();

// Every entry operation is scoped to the authenticated user.
router.use(requireUser);

// Full export of the user's record. Declared before "/:id"-style routes; the
// path is distinct from the GET "/" timeline.
router.get(
  '/export',
  asyncHandler(async (req, res) => {
    const query = exportQuerySchema.parse(req.query);
    const entries = await listAllEntries(getUserId(req), { includeDeleted: query.includeDeleted });
    const stamp = new Date().toISOString().slice(0, 10);

    if (query.format === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="trace-export-${stamp}.json"`);
      res.status(200).send(JSON.stringify(entries, null, 2));
      return;
    }

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="trace-export-${stamp}.md"`);
    res.status(200).send(buildMarkdown(entries));
  }),
);

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

// Bulk hard-delete of all the user's entries (irreversible danger-zone action).
router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const deleted = await deleteAllEntries(getUserId(req));
    res.status(200).json({ deleted });
  }),
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = listQuerySchema.parse(req.query);
    const page = await listEntries(getUserId(req), {
      ...(query.limit !== undefined ? { limit: query.limit } : {}),
      ...(query.cursor !== undefined ? { cursor: query.cursor } : {}),
      ...(query.q !== undefined ? { q: query.q } : {}),
      ...(query.tag !== undefined ? { tag: query.tag } : {}),
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

import { Router, type Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/async-handler';
import { requireUser, getUserId } from '../middleware/auth';
import {
  createEntry,
  listEntries,
  updateEntry,
  softDeleteEntry,
  restoreEntry,
  deleteAllEntries,
  countEntries,
  iterateEntryBatches,
  MAX_ENTRY_BODY_LENGTH,
  type EntryDTO,
} from '../services/entry.service';

const bodySchema = z
  .string()
  .min(1, 'body must not be empty')
  .max(MAX_ENTRY_BODY_LENGTH, `body must be at most ${MAX_ENTRY_BODY_LENGTH} characters`);

const createEntrySchema = z.object({
  body: bodySchema,
  occurredAt: z.string().datetime({ offset: true }).optional(),
});

const updateEntrySchema = z
  .object({
    body: bodySchema.optional(),
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

function writeMarkdownEntry(res: Response, entry: EntryDTO, currentDay: { value: string }): void {
  const day = entry.occurredAt.slice(0, 10);
  if (day !== currentDay.value) {
    currentDay.value = day;
    res.write(`## ${day}\n\n`);
  }
  const time = entry.occurredAt.slice(11, 16);
  res.write(`- **${time}** — ${entry.body.replace(/\r?\n/g, ' ')}\n`);
}

async function streamJsonExport(
  res: Response,
  userId: string,
  includeDeleted: boolean | undefined,
): Promise<void> {
  res.write('[\n');
  let first = true;
  for await (const batch of iterateEntryBatches(userId, { includeDeleted })) {
    for (const entry of batch) {
      if (!first) res.write(',\n');
      first = false;
      const json = JSON.stringify(entry, null, 2)
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n');
      res.write(json);
    }
  }
  res.write('\n]\n');
  res.end();
}

async function streamMarkdownExport(
  res: Response,
  userId: string,
  includeDeleted: boolean | undefined,
): Promise<void> {
  const total = await countEntries(userId, { includeDeleted });
  const stamp = new Date().toISOString().slice(0, 10);
  res.write(`# Trace export\n\n_${total} moments · exported ${stamp}_\n\n`);
  const currentDay = { value: '' };
  for await (const batch of iterateEntryBatches(userId, { includeDeleted })) {
    for (const entry of batch) {
      writeMarkdownEntry(res, entry, currentDay);
    }
  }
  res.write('\n');
  res.end();
}

const router = Router();

// Every entry operation is scoped to the authenticated user.
router.use(requireUser);

// Full export of the user's record. Declared before "/:id"-style routes; the
// path is distinct from the GET "/" timeline. Streams in batches to avoid
// loading the entire corpus into memory.
router.get(
  '/export',
  asyncHandler(async (req, res) => {
    const query = exportQuerySchema.parse(req.query);
    const userId = getUserId(req);
    const stamp = new Date().toISOString().slice(0, 10);

    if (query.format === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="trace-export-${stamp}.json"`);
      res.status(200);
      await streamJsonExport(res, userId, query.includeDeleted);
      return;
    }

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="trace-export-${stamp}.md"`);
    res.status(200);
    await streamMarkdownExport(res, userId, query.includeDeleted);
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

import { Types, type QueryFilter } from 'mongoose';
import { EntryModel, type Entry, type EntryDocument } from '../models/entry';
import { NotFoundError, ValidationError } from '../lib/errors';

export interface EntryDTO {
  id: string;
  body: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  source: string;
}

export interface EntryPage {
  items: EntryDTO[];
  nextCursor: string | null;
}

export interface CreateEntryInput {
  body: string;
  occurredAt?: Date;
}

export interface UpdateEntryInput {
  body?: string;
  occurredAt?: Date;
}

export interface ListOptions {
  limit?: number;
  cursor?: string;
  includeDeleted?: boolean;
  /** Case-insensitive substring match against the body (full-text search). */
  q?: string;
  /** Restrict to entries whose body contains this #tag. */
  tag?: string;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
/** Domain cap for a single moment body (defense beyond the 1mb JSON payload). */
export const MAX_ENTRY_BODY_LENGTH = 10_000;
const EXPORT_BATCH_SIZE = 100;

/** Escapes a user-supplied string for safe use inside a RegExp. */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toEntryDTO(doc: EntryDocument): EntryDTO {
  return {
    id: doc._id.toString(),
    body: doc.body,
    occurredAt: doc.occurredAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    deleted: doc.deleted,
    source: doc.source,
  };
}

interface DecodedCursor {
  occurredAt: Date;
  id: Types.ObjectId;
}

function encodeCursor(doc: EntryDocument): string {
  const payload = JSON.stringify({ o: doc.occurredAt.toISOString(), i: doc._id.toString() });
  return Buffer.from(payload, 'utf8').toString('base64url');
}

function decodeCursor(raw: string): DecodedCursor {
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as { o?: unknown; i?: unknown };
    if (typeof parsed.o !== 'string' || typeof parsed.i !== 'string') {
      throw new Error('cursor shape');
    }
    const occurredAt = new Date(parsed.o);
    if (Number.isNaN(occurredAt.getTime()) || !Types.ObjectId.isValid(parsed.i)) {
      throw new Error('cursor values');
    }
    return { occurredAt, id: new Types.ObjectId(parsed.i) };
  } catch {
    throw new ValidationError('Invalid cursor');
  }
}

function assertNonEmptyBody(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    throw new ValidationError('body must not be empty');
  }
  if (trimmed.length > MAX_ENTRY_BODY_LENGTH) {
    throw new ValidationError(`body must be at most ${MAX_ENTRY_BODY_LENGTH} characters`);
  }
  return trimmed;
}

/**
 * Creates (captures) an entry for the user. `createdAt` is server-set and never
 * accepted from input; `occurredAt` defaults to now but may be supplied
 * (FR-012/013/015).
 */
export async function createEntry(userId: string, input: CreateEntryInput): Promise<EntryDTO> {
  const body = assertNonEmptyBody(input.body);
  const entry = await EntryModel.create({
    userId: new Types.ObjectId(userId),
    body,
    ...(input.occurredAt ? { occurredAt: input.occurredAt } : {}),
  });
  return toEntryDTO(entry);
}

/**
 * Lists the user's entries newest-first by occurredAt, keyset-paginated on
 * (occurredAt, _id) (R-06). Excludes soft-deleted entries unless includeDeleted.
 * Every query is scoped by userId — the single place isolation is enforced (R-03).
 */
export async function listEntries(userId: string, options: ListOptions = {}): Promise<EntryPage> {
  const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

  const filter = buildListFilter(userId, options);
  if (options.cursor) {
    const cursor = decodeCursor(options.cursor);
    addAnd(filter, {
      $or: [
        { occurredAt: { $lt: cursor.occurredAt } },
        { occurredAt: cursor.occurredAt, _id: { $lt: cursor.id } },
      ],
    });
  }

  const docs = await EntryModel.find(filter)
    .sort({ occurredAt: -1, _id: -1 })
    .limit(limit + 1);

  const hasMore = docs.length > limit;
  const items = hasMore ? docs.slice(0, limit) : docs;
  const last = items[items.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last) : null;

  return { items: items.map(toEntryDTO), nextCursor };
}

type EntryFilter = QueryFilter<Entry>;

function addAnd(filter: EntryFilter, clause: EntryFilter): void {
  (filter.$and ??= []).push(clause);
}

/**
 * Builds the scoped query for a user, applying optional search (`q`) and `tag`
 * filters as ANDed body-regex clauses. userId scoping is always applied — the
 * single place per-user isolation is enforced (R-03).
 */
function buildListFilter(userId: string, options: ListOptions): EntryFilter {
  const filter: EntryFilter = { userId: new Types.ObjectId(userId) };
  if (!options.includeDeleted) {
    filter.deleted = false;
  }
  const q = options.q?.trim();
  if (q) {
    addAnd(filter, { body: { $regex: escapeRegex(q), $options: 'i' } });
  }
  const tag = options.tag?.trim().replace(/^#/, '');
  if (tag) {
    // Match "#tag" not followed by another tag-character, case-insensitively.
    addAnd(filter, { body: { $regex: `#${escapeRegex(tag)}(?![\\w-])`, $options: 'i' } });
  }
  return filter;
}

/**
 * Returns every entry the user owns, newest-first, with no pagination — the
 * source for a full export. Excludes soft-deleted entries unless asked.
 * Prefer {@link iterateEntryBatches} for large corpora to avoid loading all
 * documents into memory at once.
 */
export async function listAllEntries(
  userId: string,
  options: { includeDeleted?: boolean } = {},
): Promise<EntryDTO[]> {
  const filter = buildListFilter(userId, { includeDeleted: options.includeDeleted });
  const docs = await EntryModel.find(filter).sort({ occurredAt: -1, _id: -1 });
  return docs.map(toEntryDTO);
}

/** Counts entries matching the same scope as list/export (for export headers). */
export async function countEntries(
  userId: string,
  options: { includeDeleted?: boolean } = {},
): Promise<number> {
  const filter = buildListFilter(userId, { includeDeleted: options.includeDeleted });
  return EntryModel.countDocuments(filter);
}

/**
 * Yields the user's entries newest-first in fixed-size batches (keyset cursor).
 * Used by streaming export so large corpora do not require a full in-memory load.
 */
export async function* iterateEntryBatches(
  userId: string,
  options: { includeDeleted?: boolean; batchSize?: number } = {},
): AsyncGenerator<EntryDTO[], void, undefined> {
  const batchSize = options.batchSize ?? EXPORT_BATCH_SIZE;
  let cursor: string | undefined;
  for (;;) {
    const page = await listEntries(userId, {
      limit: batchSize,
      includeDeleted: options.includeDeleted,
      ...(cursor ? { cursor } : {}),
    });
    if (page.items.length === 0) {
      return;
    }
    yield page.items;
    if (!page.nextCursor) {
      return;
    }
    cursor = page.nextCursor;
  }
}

/**
 * Permanently deletes ALL of the user's entries (hard delete). This is the
 * irreversible "danger zone" bulk action, distinct from per-entry soft delete.
 * Returns the number removed.
 */
export async function deleteAllEntries(userId: string): Promise<number> {
  const result = await EntryModel.deleteMany({ userId: new Types.ObjectId(userId) });
  return result.deletedCount ?? 0;
}

/**
 * Loads an entry the user owns, or throws NotFound. Used as the ownership gate
 * for all mutations — a foreign or non-existent id is indistinguishable (404),
 * so we never reveal that another user's resource exists (isolation, FR-040).
 */
async function findOwnedOrThrow(userId: string, id: string): Promise<EntryDocument> {
  if (!Types.ObjectId.isValid(id)) {
    throw new NotFoundError('Entry not found');
  }
  const entry = await EntryModel.findOne({
    _id: new Types.ObjectId(id),
    userId: new Types.ObjectId(userId),
  });
  if (!entry) {
    throw new NotFoundError('Entry not found');
  }
  return entry;
}

/**
 * Edits an entry's body and/or backdates its occurredAt. `createdAt` is never
 * accepted or mutated; `updatedAt` refreshes on save (FR-030/031, FR-2.3).
 */
export async function updateEntry(
  userId: string,
  id: string,
  input: UpdateEntryInput,
): Promise<EntryDTO> {
  const entry = await findOwnedOrThrow(userId, id);

  if (input.body !== undefined) {
    entry.body = assertNonEmptyBody(input.body);
  }
  if (input.occurredAt !== undefined) {
    entry.occurredAt = input.occurredAt;
  }

  await entry.save();
  return toEntryDTO(entry);
}

/** Soft-deletes (hides) an entry; recoverable via restore (FR-032, ADR-0004). */
export async function softDeleteEntry(userId: string, id: string): Promise<void> {
  const entry = await findOwnedOrThrow(userId, id);
  if (!entry.deleted) {
    entry.deleted = true;
    await entry.save();
  }
}

/** Restores a soft-deleted entry to the timeline (FR-032). */
export async function restoreEntry(userId: string, id: string): Promise<EntryDTO> {
  const entry = await findOwnedOrThrow(userId, id);
  if (entry.deleted) {
    entry.deleted = false;
    await entry.save();
  }
  return toEntryDTO(entry);
}

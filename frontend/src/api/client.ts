// Thin fetch client for the Trace backend.
//
// Base URL is `/api` so requests stay same-origin; the Vite dev/preview proxy
// (vite.config.js) forwards them to the Express API, and in production the app
// is expected to be served behind the same origin as the API. Override with
// VITE_API_BASE when that is not the case.

const BASE_URL = import.meta.env.VITE_API_BASE || '/api';
const TOKEN_KEY = 'trace.token';

/** Error carrying the backend's `{ error: { code, message } }` envelope. */
export class ApiError extends Error {
  status: number;
  code: string;
  details: unknown;

  constructor(status: number, code: string, message?: string, details?: unknown) {
    super(message || code || `Request failed (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code || 'UNKNOWN';
    this.details = details;
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — session simply won't persist */
  }
}

type UnauthorizedListener = () => void;

// Listeners notified whenever a request is rejected as unauthenticated, so the
// app can drop the session and return to the gateway.
const unauthorizedListeners = new Set<UnauthorizedListener>();
export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

interface RequestOptions {
  body?: unknown;
  auth?: boolean;
}

async function request(method: string, path: string, { body, auth = true }: RequestOptions = {}) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['content-type'] = 'application/json';

  const token = auth ? getToken() : null;
  if (token) headers.authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server. Check your connection.');
  }

  if (response.status === 204) return null;

  let payload: any = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const envelope = payload && payload.error ? payload.error : {};
    if (response.status === 401 && auth) {
      for (const listener of unauthorizedListeners) listener();
    }
    throw new ApiError(response.status, envelope.code, envelope.message, envelope.details);
  }

  return payload;
}

// Streams an authenticated file download (used for export). Returns the blob
// and a server-suggested filename parsed from Content-Disposition.
async function downloadRequest(path: string) {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { method: 'GET', headers });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server. Check your connection.');
  }

  if (!response.ok) {
    if (response.status === 401) {
      for (const listener of unauthorizedListeners) listener();
    }
    let envelope: { code?: string; message?: string } = {};
    try {
      envelope = (await response.json()).error || {};
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(response.status, envelope.code || 'UNKNOWN', envelope.message);
  }

  const disposition = response.headers.get('content-disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const blob = await response.blob();
  return { blob, filename: match ? match[1] : null };
}

export const api = {
  register: (email: string, password: string) =>
    request('POST', '/auth/register', { body: { email, password }, auth: false }),
  login: (email: string, password: string) =>
    request('POST', '/auth/login', { body: { email, password }, auth: false }),
  logout: () => request('POST', '/auth/logout'),
  me: () => request('GET', '/auth/me'),
  forgotPassword: (email: string) =>
    request('POST', '/auth/forgot-password', { body: { email }, auth: false }),
  resetPassword: (token: string, password: string) =>
    request('POST', '/auth/reset-password', { body: { token, password }, auth: false }),
  deleteAccount: () => request('DELETE', '/auth/me'),

  listEntries: ({
    limit,
    cursor,
    includeDeleted,
    q,
    tag,
  }: {
    limit?: number;
    cursor?: string;
    includeDeleted?: boolean;
    q?: string;
    tag?: string;
  } = {}) => {
    const params = new URLSearchParams();
    if (limit != null) params.set('limit', String(limit));
    if (cursor) params.set('cursor', cursor);
    if (q) params.set('q', q);
    if (tag) params.set('tag', tag);
    if (includeDeleted) params.set('includeDeleted', 'true');
    const qs = params.toString();
    return request('GET', `/entries${qs ? `?${qs}` : ''}`);
  },
  createEntry: ({ body, occurredAt }: { body: string; occurredAt?: string } = { body: '' }) =>
    request('POST', '/entries', {
      body: { body, ...(occurredAt ? { occurredAt } : {}) },
    }),
  updateEntry: (id: string, patch: Record<string, unknown>) =>
    request('PATCH', `/entries/${id}`, { body: patch }),
  deleteEntry: (id: string) => request('DELETE', `/entries/${id}`),
  restoreEntry: (id: string) => request('POST', `/entries/${id}/restore`),
  deleteAllEntries: () => request('DELETE', '/entries'),
  exportEntries: (format: string) =>
    downloadRequest(`/entries/export?format=${encodeURIComponent(format)}`),
};

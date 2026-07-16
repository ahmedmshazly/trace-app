/**
 * Browser session cookie for the SPA (audit FR-003).
 * The JWT itself stays the session credential; the cookie is only the transport
 * so XSS cannot read it from `localStorage`. API clients may still send Bearer.
 */
import type { Response } from 'express';
import { config } from '../config';

export const SESSION_COOKIE = 'trace_session';

function cookieSecure(): boolean {
  return config.isProduction || Boolean(process.env.VERCEL);
}

/** Max-Age in seconds derived loosely from JWT_EXPIRES_IN (falls back to 24h). */
function cookieMaxAgeSeconds(): number {
  const raw = config.jwtExpiresIn.trim();
  const match = /^(\d+)([smhd])$/i.exec(raw);
  if (!match?.[1] || !match[2]) return 24 * 60 * 60;
  const n = Number(match[1]);
  const unit = match[2].toLowerCase();
  const mult = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
  return n * mult;
}

export function setSessionCookie(res: Response, token: string): void {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${cookieMaxAgeSeconds()}`,
  ];
  if (cookieSecure()) parts.push('Secure');
  res.append('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(res: Response): void {
  const parts = [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0'];
  if (cookieSecure()) parts.push('Secure');
  res.append('Set-Cookie', parts.join('; '));
}

/** Lightweight Cookie header parser for our single session cookie. */
export function readSessionCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [rawName, ...rest] = part.trim().split('=');
    if (rawName === SESSION_COOKIE) {
      const value = rest.join('=');
      try {
        return decodeURIComponent(value);
      } catch {
        return value || null;
      }
    }
  }
  return null;
}

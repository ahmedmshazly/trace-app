// Pure helpers for turning backend EntryDTOs into the shape the timeline UI
// wants: day groups, human day/time labels, and parsed #tags.

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** "Today" / "Yesterday" / "Mon · Jun 16" (current year) / "Jun 16, 2024". */
export function dayLabel(iso) {
  const date = new Date(iso);
  const today = startOfDay(new Date());
  const that = startOfDay(date);
  const diffDays = Math.round((today.getTime() - that.getTime()) / DAY_MS);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  const weekday = date.toLocaleDateString(undefined, { weekday: 'short' });
  const monthDay = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  if (date.getFullYear() === new Date().getFullYear()) {
    return `${weekday} · ${monthDay}`;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// When null, the viewer's locale decides 12h vs 24h. A boolean forces it,
// driven by the Settings preference. Module-level so every timestamp call site
// honors it without prop-drilling.
let forceHour12 = null;

/** Sets the global clock format: true = 12-hour, false = 24-hour, null = locale. */
export function setHour12(value) {
  forceHour12 = typeof value === 'boolean' ? value : null;
}

/** "4:18 PM" (or "16:18") in the viewer's locale/timezone. */
export function timeLabel(iso) {
  const options = { hour: 'numeric', minute: '2-digit' };
  if (forceHour12 !== null) options.hour12 = forceHour12;
  return new Date(iso).toLocaleTimeString(undefined, options);
}

/** A short relative label for fresh captures: "just now", "5m ago", else the clock time. */
export function relativeTimeLabel(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 45 * 1000) return 'just now';
  if (diffMs < 60 * 60 * 1000) return `${Math.round(diffMs / 60000)}m ago`;
  return timeLabel(iso);
}

const TAG_RE = /#([\p{L}\p{N}_-]+)/gu;

/** Extract distinct lowercase tags from an entry body, in first-seen order. */
export function parseTags(body) {
  const seen = new Set();
  const out = [];
  for (const match of String(body || '').matchAll(TAG_RE)) {
    const tag = match[1].toLowerCase();
    if (!seen.has(tag)) {
      seen.add(tag);
      out.push(tag);
    }
  }
  return out;
}

/**
 * Group entries (already newest-first by occurredAt) into day buckets,
 * preserving order. Returns [{ key, label, items: [...] }].
 */
export function groupByDay(entries) {
  const groups = [];
  let current = null;
  for (const entry of entries) {
    const key = startOfDay(new Date(entry.occurredAt)).getTime();
    if (!current || current.key !== key) {
      current = { key, label: dayLabel(entry.occurredAt), items: [] };
      groups.push(current);
    }
    current.items.push(entry);
  }
  return groups;
}

/** Tally tag → count across the given entries, sorted by count desc then name. */
export function tagCounts(entries) {
  const counts = new Map();
  for (const entry of entries) {
    for (const tag of parseTags(entry.body)) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

// Capture + Timeline with the
// onboarding empty state, wired to the live API: real capture, paginated
// timeline, inline edit, backdate, soft-delete with undo, draft persistence,
// server-side search / tag index / export, theme, and logout.
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import {
  groupByDay,
  timeLabel,
  relativeTimeLabel,
  setHour12,
} from '../lib/entries';
import type { ReactNode, MouseEvent, ChangeEvent } from 'react';

const {
  Logo, Button, IconButton, Kbd, Icon,
  CaptureBar, TimelineEntry, DayHeader, TagPill,
  Banner, SegmentedToggle, Switch, Select, TextField, Toast, ToastViewport, Dialog,
} = window.TRACE_UI;

const { useState, useEffect, useRef, useCallback, useMemo, Fragment } = React;

const PAGE_LIMIT = 50;
const DRAFT_KEY = 'trace.draft';
const THEME_KEY = 'trace.theme';
const PREFS_KEY = 'trace.prefs';

interface Prefs {
  clock24: boolean;
  exportFormat: string;
}

interface EntryRow {
  id: string;
  body: string;
  occurredAt: string;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
  source?: string;
  _pending?: boolean;
  _fresh?: boolean;
  [key: string]: unknown;
}

interface TagCount {
  tag: string;
  count: number;
}

interface ToastState {
  tone?: string;
  title?: string;
  message?: string;
  duration?: number;
  action?: ReactNode;
}

const DEFAULT_PREFS: Prefs = { clock24: false, exportFormat: 'Markdown' };

function readPrefs(): Prefs {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}
function writePrefs(prefs: Prefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

// Newest-first by occurredAt, tie-broken by id, matching the backend ordering.
function sortEntries(list: EntryRow[]): EntryRow[] {
  return [...list].sort((a, b) => {
    const diff = new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
    if (diff !== 0) return diff;
    return String(b.id).localeCompare(String(a.id));
  });
}

function readDraft(): string {
  try {
    return localStorage.getItem(DRAFT_KEY) || '';
  } catch {
    return '';
  }
}
function writeDraft(value: string): void {
  try {
    if (value) localStorage.setItem(DRAFT_KEY, value);
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

// ── Command palette (⌘K) — server-side search across the whole record ──
function CommandPalette({
  tags,
  initialTag,
  onClose,
}: {
  tags: TagCount[];
  initialTag?: string | null;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(initialTag || null);
  const [results, setResults] = useState<EntryRow[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Focus trap within the dialog.
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const showResults = Boolean(q || filterTag);

  // Debounced server search over the entire corpus (not just loaded entries).
  useEffect(() => {
    if (!showResults) {
      setResults([]);
      setSearching(false);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const page = await api.listEntries({
          limit: 50,
          ...(q.trim() ? { q: q.trim() } : {}),
          ...(filterTag ? { tag: filterTag } : {}),
        });
        if (!cancelled) setResults(page.items as EntryRow[]);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [q, filterTag, showResults]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search moments"
      onMouseDown={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 'var(--z-overlay)', background: 'var(--color-scrim)',
        backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', paddingTop: '12vh',
      }}
    >
      <div
        ref={panelRef}
        onMouseDown={(e: MouseEvent) => e.stopPropagation()}
        style={{
          width: 'min(620px, 92vw)', background: 'var(--color-elevated)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-text-muted)' }}><Icon name="search" size={18} /></span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
            placeholder="Search moments…"
            className="cp-input"
            aria-label="Search moments"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)',
            }}
          />
          <Kbd>esc</Kbd>
        </div>

        {filterTag && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--color-border)' }}>
            <TagPill label={filterTag} onClick={() => setFilterTag(null)} />
            <button
              onClick={() => { setFilterTag(null); setQ(''); }}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-accent-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-meta)',
              }}
            >
              Clear all
            </button>
          </div>
        )}

        <div style={{ maxHeight: '44vh', overflowY: 'auto', padding: '8px' }}>
          {!showResults && (
            <div style={{ padding: '6px 8px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-text-muted)', padding: '6px 8px' }}>
                {tags.length ? 'Jump to tag' : 'Type to search your moments'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 8px 10px' }}>
                {tags.slice(0, 8).map((t) => (
                  <TagPill key={t.tag} label={t.tag} count={t.count} onClick={() => setFilterTag(t.tag)} />
                ))}
              </div>
            </div>
          )}
          {showResults && results.map((e) => (
            <TimelineEntry key={e.id} time={timeLabel(e.occurredAt)} body={e.body} />
          ))}
          {showResults && !searching && results.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-meta)' }}>
              No moments match.
            </div>
          )}
          {showResults && searching && results.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-meta)' }}>
              Searching…
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 14, padding: '10px 16px', borderTop: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}>
          <span><Kbd>esc</Kbd> close</span>
          <span style={{ marginLeft: 'auto' }}>
            {showResults ? `${results.length} match${results.length === 1 ? '' : 'es'} · across your whole record` : 'searching your whole record'}
          </span>
        </div>
      </div>
      <style>{`.cp-input::placeholder{color:var(--color-text-muted);}`}</style>
    </div>
  );
}

// ── Tag index slide-in — counts computed from loaded entries ──────────
function TagIndexPanel({
  tags,
  onClose,
  onJump,
}: {
  tags: TagCount[];
  onClose: () => void;
  onJump: (tag: string) => void;
}) {
  const [sort, setSort] = useState('By count');
  const max = Math.max(1, ...tags.map((t) => t.count));
  const sorted = sort === 'A–Z'
    ? [...tags].sort((a, b) => a.tag.localeCompare(b.tag))
    : [...tags].sort((a, b) => b.count - a.count);
  return (
    <div onMouseDown={onClose} style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-panel)', background: 'var(--color-scrim)' }}>
      <aside
        onMouseDown={(e: MouseEvent) => e.stopPropagation()}
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(340px, 88vw)',
          background: 'var(--color-elevated)', borderLeft: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column',
          animation: 'slidein var(--duration-slow) var(--ease-out)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}><Icon name="tagindex" size={18} /></span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-title)', color: 'var(--color-text-primary)' }}>Tags</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}>{tags.length}</span>
          <span style={{ marginLeft: 'auto' }}><IconButton icon="close" label="Close" onClick={onClose} /></span>
        </div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <SegmentedToggle size="sm" options={['By count', 'A–Z']} value={sort} onChange={setSort} />
        </div>
        <div style={{ overflowY: 'auto', padding: '6px 8px' }}>
          {sorted.length === 0 && (
            <div style={{ padding: '20px 12px', color: 'var(--color-text-muted)', fontSize: 'var(--text-meta)' }}>
              No #tags yet. Add one inside a moment, like “coffee #morning”.
            </div>
          )}
          {sorted.map((t) => (
            <button
              key={t.tag}
              className="tagrow"
              onClick={() => onJump(t.tag)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '9px 8px',
                background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <TagPill label={t.tag} />
              <span style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: (t.count / max * 100) + '%', background: 'var(--color-accent-secondary)', opacity: 0.7 }} />
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', color: 'var(--color-text-secondary)', width: 28, textAlign: 'right' }}>{t.count}</span>
            </button>
          ))}
        </div>
        <style>{`@keyframes slidein{from{transform:translateX(100%)}to{transform:translateX(0)}}
          .tagrow:hover{background:var(--color-hover-wash);}`}</style>
      </aside>
    </div>
  );
}

// ── Settings & export ─────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 18, marginBottom: 16 }}>
      <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', margin: '0 0 14px' }}>{title}</h2>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
      <span style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-muted)' }}>{label}</span>
      {children}
    </div>
  );
}

// Irreversible action gate: typed phrase + password re-entry (server step-up).
function ConfirmDialog({ title, description, phrase, confirmLabel, busy, onCancel, onConfirm }: {
  title: string; description: string; phrase: string; confirmLabel: string;
  busy: boolean; onCancel: () => void; onConfirm: (password: string) => void;
}) {
  const [typed, setTyped] = useState('');
  const [password, setPassword] = useState('');
  const armed = typed.trim().toLowerCase() === phrase.toLowerCase() && password.length > 0;
  return (
    <Dialog
      open
      title={title}
      description={description}
      onClose={onCancel}
      actions={
        <Fragment>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button variant="danger" size="sm" icon="warn" onClick={() => onConfirm(password)} disabled={!armed || busy}>
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </Fragment>
      }
    >
      <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-muted)', margin: '0 0 10px' }}>
        Type <strong style={{ color: 'var(--color-text-secondary)' }}>{phrase}</strong> to confirm.
      </p>
      <TextField
        autoFocus
        value={typed}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTyped(e.target.value)}
        placeholder={phrase}
      />
      <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-muted)', margin: '14px 0 10px' }}>
        Re-enter your password to continue.
      </p>
      <TextField
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        placeholder="Password"
      />
    </Dialog>
  );
}

function SettingsScreen({
  theme, onTheme, onBack, email, onLogout, onExport, exportBusy,
  prefs, onPrefs, onDeleteAll, onDeleteAccount,
}: {
  theme: string;
  onTheme: (t: string) => void;
  onBack: () => void;
  email?: string;
  onLogout: () => void;
  onExport: (fmt: string) => void;
  exportBusy: boolean;
  prefs: Prefs;
  onPrefs: (p: Prefs) => void;
  onDeleteAll: () => void;
  onDeleteAccount: () => void;
}) {
  const [fmt, setFmt] = useState(prefs.exportFormat || 'Markdown');
  return (
    <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto', padding: '8px 0 64px' }}>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-meta)', padding: '8px 0 16px' }}>
        ← back to timeline
      </button>
      <h1 style={{ fontSize: 'var(--text-heading)', marginBottom: 20 }}>Settings</h1>

      <Section title="Export">
        <Field label="Format"><SegmentedToggle size="sm" options={['Markdown', 'JSON']} value={fmt} onChange={setFmt} /></Field>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}>your whole record · {fmt.toLowerCase()}</span>
          <Button variant="primary" icon="export" onClick={() => onExport(fmt)} disabled={exportBusy}>
            {exportBusy ? 'Exporting…' : 'Export'}
          </Button>
        </div>
      </Section>

      <Section title="Preferences">
        <div style={{ marginBottom: 14 }}>
          <Switch
            checked={prefs.clock24}
            onChange={(next) => onPrefs({ ...prefs, clock24: next })}
            label="24-hour time"
            description="Show timestamps as 16:18 instead of 4:18 PM."
          />
        </div>
        <Select
          label="Default export format"
          hint="Preselected when you open Export."
          options={['Markdown', 'JSON']}
          value={prefs.exportFormat}
          onChange={(e) => { setFmt(e.target.value); onPrefs({ ...prefs, exportFormat: e.target.value }); }}
        />
      </Section>

      <Section title="Appearance">
        <Field label="Theme"><SegmentedToggle options={['Light', 'Dark']} value={theme === 'dark' ? 'Dark' : 'Light'} onChange={(v) => onTheme(v === 'Dark' ? 'dark' : 'light')} /></Field>
        <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-muted)', margin: '8px 0 0' }}>Dark is first-class, not an afterthought.</p>
      </Section>

      <Section title="Account">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{email || '—'}</span>
          <Button variant="ghost" size="sm" icon="logout" onClick={onLogout}>Log out</Button>
        </div>
      </Section>

      <div style={{ border: '1px solid var(--color-state-error)', borderRadius: 'var(--radius-md)', padding: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--color-state-error)' }}>
          <Icon name="warn" size={16} /><span style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>Danger zone</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)' }}>Delete all moments</div>
            <div style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}>Permanently erase every entry. Your account stays.</div>
          </div>
          <Button variant="danger" size="sm" icon="archive" onClick={onDeleteAll}>Delete all</Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)' }}>Delete account</div>
            <div style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}>Erase your account and everything in it. Cannot be undone.</div>
          </div>
          <Button variant="danger" size="sm" icon="logout" onClick={onDeleteAccount}>Delete account</Button>
        </div>
      </div>
    </div>
  );
}

// ── Backdate dialog (edit occurredAt) ─────────────────────────────────
function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function BackdateDialog({
  entry,
  onCancel,
  onConfirm,
}: {
  entry: EntryRow;
  onCancel: () => void;
  onConfirm: (iso: string) => void;
}) {
  const [value, setValue] = useState(() => toLocalInputValue(entry.occurredAt));
  return (
    <Dialog
      open
      title="Adjust the time"
      description="When did this moment happen? The created time stays locked."
      onClose={onCancel}
      actions={
        <Fragment>
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button
            variant="primary"
            size="sm"
            icon="clock"
            onClick={() => {
              const next = new Date(value);
              if (!Number.isNaN(next.getTime())) onConfirm(next.toISOString());
            }}
          >
            Save time
          </Button>
        </Fragment>
      }
    >
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '10px 12px',
          background: 'var(--color-base)', color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
        }}
      />
    </Dialog>
  );
}

// ── A single timeline row, with inline editing ────────────────────────
function TimelineRow({
  entry,
  onEdit,
  onAdjustTime,
  onDelete,
}: {
  entry: EntryRow;
  onEdit: (body: string) => Promise<void>;
  onAdjustTime?: () => void;
  onDelete?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry.body);
  const [busy, setBusy] = useState(false);

  function begin() {
    setText(entry.body);
    setEditing(true);
  }

  async function save() {
    const next = text.trim();
    if (!next || next === entry.body) {
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      await onEdit(next);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
        <TextField
          multiline
          autoFocus
          value={text}
          onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void save(); }
            if (e.key === 'Escape') setEditing(false);
          }}
          containerStyle={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          <Button variant="primary" size="sm" icon="check" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    );
  }

  const time = entry._fresh ? relativeTimeLabel(entry.occurredAt) : timeLabel(entry.occurredAt);
  return (
    <TimelineEntry
      time={time}
      body={entry.body}
      state={entry._pending ? 'new' : entry._fresh ? 'new' : 'default'}
      onEdit={begin}
      onAdjustTime={onAdjustTime}
      onDelete={onDelete}
    />
  );
}

// ── Onboarding empty state ─────────────────────────────────────────
const STARTERS = ['What just happened?', 'A small win today.', 'Something you noticed.'];
const HINTS = [
  { keys: '⏎', label: 'commit' },
  { keys: '⇧⏎', label: 'newline' },
  { keys: '#tag', label: 'file it' },
  { keys: '⌘K', label: 'find it later' },
];
function AnchoredMark() {
  return (
    <svg width="56" height="120" viewBox="0 0 56 120" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="trace-onb-line" x1="28" y1="20" x2="28" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--color-text-secondary)" />
          <stop offset="1" stopColor="var(--color-text-secondary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="28" y1="34" x2="28" y2="120" stroke="url(#trace-onb-line)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="28" cy="22" r="11" fill="var(--color-accent-primary)" />
    </svg>
  );
}
function EmptyState({ onStarter }: { onStarter: (text: string) => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}><AnchoredMark /></div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-heading)', color: 'var(--color-text-primary)', margin: '0 0 10px', letterSpacing: 'var(--tracking-tight)' }}>
        Nothing logged yet.
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-normal)', color: 'var(--color-text-secondary)', margin: '0 auto', maxWidth: 440 }}>
        Your first moment starts in the field above — just start typing.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 18px', margin: '26px 0 30px' }}>
        {HINTS.map((h) => (
          <span key={h.keys} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <Kbd>{h.keys}</Kbd>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}>{h.label}</span>
          </span>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 22, maxWidth: 420, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }}>
          Not sure where to start
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          {STARTERS.map((s) => (
            <button
              key={s}
              className="onb-starter"
              onClick={() => onStarter(s)}
              style={{
                width: '100%', maxWidth: 380, textAlign: 'left', cursor: 'pointer', padding: '11px 14px',
                background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <span style={{ color: 'var(--color-text-muted)', flex: '0 0 auto', display: 'inline-flex' }}><Icon name="capture" size={15} /></span>
              <span style={{ flex: 1 }}>{s}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}>use</span>
            </button>
          ))}
        </div>
      </div>
      <style>{`.onb-starter:hover{border-color:var(--color-accent-primary);background:var(--color-hover-wash);}`}</style>
    </div>
  );
}

// ── App shell ─────────────────────────────────────────────────────────
export function AppScreen() {
  const { user, logout } = useAuth();

  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tags, setTags] = useState<TagCount[]>([]);

  const [draft, setDraft] = useState(() => readDraft());
  const [showDraftBanner, setShowDraftBanner] = useState(() => readDraft().length > 0);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteTag, setPaletteTag] = useState<string | null>(null);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [backdateEntry, setBackdateEntry] = useState<EntryRow | null>(null);

  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch { return 'dark'; }
  });
  const [prefs, setPrefs] = useState(readPrefs);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [exportBusy, setExportBusy] = useState(false);
  const [danger, setDanger] = useState<'all' | 'account' | null>(null);
  const [dangerBusy, setDangerBusy] = useState(false);
  const tempId = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clock format preference — applied synchronously so every timestamp in this
  // render uses it (timeLabel reads a module-level flag).
  setHour12(prefs.clock24 ? false : true);

  const updatePrefs = useCallback((next: Prefs) => {
    setPrefs(next);
    writePrefs(next);
  }, []);

  // Theme — apply + persist.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  // Persist the draft as it changes.
  useEffect(() => { writeDraft(draft); }, [draft]);

  const showToast = useCallback((next: ToastState | null) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(next);
    if (next) {
      toastTimer.current = setTimeout(() => setToast(null), next.duration || 6000);
    }
  }, []);

  const refreshTags = useCallback(async () => {
    try {
      const res = await api.listTags();
      setTags((res?.tags as TagCount[]) || []);
    } catch {
      /* keep previous tags on failure */
    }
  }, []);

  // Initial load.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listEntries({ limit: PAGE_LIMIT })
      .then((page) => {
        if (cancelled) return;
        setEntries(sortEntries(page.items as EntryRow[]));
        setNextCursor(page.nextCursor);
        setLoadError(null);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setLoadError(err.message || 'Could not load your timeline.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    void refreshTags();
    return () => { cancelled = true; };
  }, [refreshTags]);

  // Keyboard: ⌘K opens search, Esc closes overlays.
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteTag(null);
        setPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false);
        setTagsOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await api.listEntries({ limit: PAGE_LIMIT, cursor: nextCursor });
      setEntries((prev) => sortEntries([...prev, ...page.items]));
      setNextCursor(page.nextCursor);
    } catch (err: any) {
      showToast({ tone: 'error', title: 'Could not load older moments', message: err.message });
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, showToast]);

  // Capture — optimistic append, then reconcile with the server's entry.
  const commit = useCallback(
    async (text) => {
      const body = String(text || '').trim();
      if (!body) return;
      if (body.length > 10000) {
        showToast({
          tone: 'error',
          title: 'Too long',
          message: 'A moment can be at most 10,000 characters.',
        });
        return;
      }
      const localId = `temp-${++tempId.current}`;
      const now = new Date().toISOString();
      const optimistic = { id: localId, body, occurredAt: now, createdAt: now, _pending: true, _fresh: true };

      setEntries((prev) => sortEntries([optimistic, ...prev]));
      setDraft('');
      setShowDraftBanner(false);

      try {
        const saved = await api.createEntry({ body });
        setEntries((prev) =>
          sortEntries(prev.map((e) => (e.id === localId ? { ...saved, _fresh: true } : e))),
        );
        void refreshTags();
        // Drop the "new" highlight after a beat.
        setTimeout(() => {
          setEntries((prev) => prev.map((e) => (e.id === saved.id ? { ...e, _fresh: false } : e)));
        }, 1600);
      } catch (err: any) {
        setEntries((prev) => prev.filter((e) => e.id !== localId));
        setDraft(body);
        showToast({ tone: 'error', title: 'Capture failed', message: err.message });
      }
    },
    [showToast, refreshTags],
  );

  const editEntry = useCallback(
    async (id: string, body: string) => {
      const prevEntry = entries.find((e) => e.id === id);
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, body } : e)));
      try {
        const saved = await api.updateEntry(id, { body });
        setEntries((prev) => sortEntries(prev.map((e) => (e.id === id ? { ...saved } : e))));
        void refreshTags();
      } catch (err: any) {
        if (prevEntry) setEntries((prev) => prev.map((e) => (e.id === id ? prevEntry : e)));
        showToast({ tone: 'error', title: 'Edit failed', message: err.message });
        throw err;
      }
    },
    [entries, showToast, refreshTags],
  );

  const backdateEntryTime = useCallback(
    async (id: string, occurredAt: string) => {
      setBackdateEntry(null);
      const prevEntry = entries.find((e) => e.id === id);
      setEntries((prev) => sortEntries(prev.map((e) => (e.id === id ? { ...e, occurredAt } : e))));
      try {
        const saved = await api.updateEntry(id, { occurredAt });
        setEntries((prev) => sortEntries(prev.map((e) => (e.id === id ? { ...saved } : e))));
      } catch (err: any) {
        if (prevEntry) setEntries((prev) => sortEntries(prev.map((e) => (e.id === id ? prevEntry : e))));
        showToast({ tone: 'error', title: 'Couldn’t change the time', message: err.message });
      }
    },
    [entries, showToast],
  );

  const deleteEntry = useCallback(
    async (id) => {
      const removed = entries.find((e) => e.id === id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      try {
        await api.deleteEntry(id);
        showToast({
          tone: 'info',
          title: 'Moment hidden',
          message: 'Nothing is erased.',
          action: (
            <Button
              variant="ghost"
              size="sm"
              icon="restore"
              onClick={async () => {
                showToast(null);
                try {
                  const restored = await api.restoreEntry(id);
                  setEntries((prev) => sortEntries([restored, ...prev.filter((e) => e.id !== id)]));
                } catch (err: any) {
                  showToast({ tone: 'error', title: 'Restore failed', message: err.message });
                }
              }}
            >
              Undo
            </Button>
          ),
        });
      } catch (err: any) {
        if (removed) setEntries((prev) => sortEntries([removed, ...prev]));
        showToast({ tone: 'error', title: 'Delete failed', message: err.message });
      }
    },
    [entries, showToast],
  );

  // Export — the server builds the full file (every entry, no pagination) and
  // streams it back as a download.
  const handleExport = useCallback(
    async (fmt) => {
      setExportBusy(true);
      try {
        const format = fmt === 'JSON' ? 'json' : 'markdown';
        const { blob, filename } = await api.exportEntries(format);
        const stamp = new Date().toISOString().slice(0, 10);
        const fallback = `trace-export-${stamp}.${format === 'json' ? 'json' : 'md'}`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || fallback;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err: any) {
        showToast({ tone: 'error', title: 'Export failed', message: err.message });
      } finally {
        setExportBusy(false);
      }
    },
    [showToast],
  );

  // Danger zone — hard, irreversible deletes (typed confirm + password step-up).
  const handleDeleteAll = useCallback(async (password: string) => {
    setDangerBusy(true);
    try {
      const { deleted } = await api.deleteAllEntries(password);
      setEntries([]);
      setNextCursor(null);
      setTags([]);
      setDanger(null);
      showToast({
        tone: 'info',
        title: 'Record cleared',
        message: `${deleted} ${deleted === 1 ? 'moment' : 'moments'} permanently deleted.`,
      });
    } catch (err: any) {
      showToast({ tone: 'error', title: 'Could not delete', message: err.message });
    } finally {
      setDangerBusy(false);
    }
  }, [showToast]);

  const handleDeleteAccount = useCallback(async (password: string) => {
    setDangerBusy(true);
    try {
      await api.deleteAccount(password);
      await logout();
    } catch (err: any) {
      setDangerBusy(false);
      showToast({ tone: 'error', title: 'Could not delete account', message: err.message });
    }
  }, [logout, showToast]);

  function useStarter(starterText: string) {
    setDraft(starterText);
    requestAnimationFrame(() => {
      const el = document.querySelector('.trace-capture') as HTMLTextAreaElement | null;
      if (el) {
        el.focus();
        try { el.selectionStart = el.selectionEnd = starterText.length; } catch { /* ignore */ }
      }
    });
  }

  const groups = useMemo(() => groupByDay(entries), [entries]);
  const isEmpty = !loading && !loadError && entries.length === 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-base)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 'var(--z-sticky)', background: 'var(--color-base)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '12px var(--layout-gutter)' }}>
          <Logo size={24} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => { setPaletteTag(null); setPaletteOpen(true); }}
              className="searchhint"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <Icon name="search" size={15} />
              <span style={{ fontSize: 'var(--text-meta)' }}>Search</span>
              <Kbd>⌘K</Kbd>
            </button>
            <IconButton icon="tagindex" label="Tag index" onClick={() => setTagsOpen(true)} />
            <IconButton icon="settings" label="Settings" active={settingsOpen} onClick={() => setSettingsOpen((s) => !s)} />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 'var(--layout-max)', margin: '0 auto', padding: '0 var(--layout-gutter)' }}>
        {settingsOpen ? (
          <SettingsScreen
            theme={theme}
            onTheme={setTheme}
            onBack={() => setSettingsOpen(false)}
            email={user?.email}
            onLogout={logout}
            onExport={handleExport}
            exportBusy={exportBusy}
            prefs={prefs}
            onPrefs={updatePrefs}
            onDeleteAll={() => setDanger('all')}
            onDeleteAccount={() => setDanger('account')}
          />
        ) : (
          <Fragment>
            <div style={{ position: 'sticky', top: 57, zIndex: 10, background: 'var(--color-base)', paddingTop: 16, paddingBottom: 8 }}>
              <CaptureBar
                value={draft}
                onChange={setDraft}
                onCommit={commit}
                autoFocus
                status={isEmpty ? 'ready · nothing committed yet' : 'anchored · now'}
                draftSaved={draft.length > 0}
              />
              {showDraftBanner && draft.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <Banner
                    tone="warning"
                    title="Draft restored"
                    actions={
                      <Fragment>
                        <Button size="sm" variant="ghost" onClick={() => { setDraft(''); setShowDraftBanner(false); }}>Discard</Button>
                        <Button size="sm" variant="primary" onClick={() => setShowDraftBanner(false)}>Keep</Button>
                      </Fragment>
                    }
                  >
                    Unsaved text from your last visit.
                  </Banner>
                </div>
              )}
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}>
                Loading your timeline…
              </div>
            )}

            {loadError && (
              <div style={{ padding: '24px 0' }}>
                <Banner tone="error" title="Couldn't load your timeline">{loadError}</Banner>
              </div>
            )}

            {isEmpty && <EmptyState onStarter={useStarter} />}

            {!loading && !loadError && entries.length > 0 && (
              <div style={{ paddingBottom: 64 }}>
                {groups.map((g) => (
                  <div key={g.key}>
                    <DayHeader label={g.label} count={g.items.length} />
                    {g.items.map((e) => (
                      <TimelineRow
                        key={e.id as string}
                        entry={e as EntryRow}
                        onEdit={(body) => editEntry(e.id as string, body)}
                        onAdjustTime={e._pending ? undefined : () => setBackdateEntry(e as EntryRow)}
                        onDelete={e._pending ? undefined : () => deleteEntry(e.id as string)}
                      />
                    ))}
                  </div>
                ))}
                {nextCursor && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Button variant="ghost" size="sm" onClick={loadMore} disabled={loadingMore}>
                      {loadingMore ? 'Loading…' : 'Load older moments'}
                    </Button>
                  </div>
                )}
                {!nextCursor && (
                  <div style={{ textAlign: 'center', padding: '20px 0', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}>
                    the beginning of your record
                  </div>
                )}
              </div>
            )}
          </Fragment>
        )}
      </main>

      {paletteOpen && (
        <CommandPalette
          tags={tags}
          initialTag={paletteTag}
          onClose={() => setPaletteOpen(false)}
        />
      )}
      {tagsOpen && (
        <TagIndexPanel
          tags={tags}
          onClose={() => setTagsOpen(false)}
          onJump={(tag) => { setTagsOpen(false); setPaletteTag(tag); setPaletteOpen(true); }}
        />
      )}
      {backdateEntry && (
        <BackdateDialog
          entry={backdateEntry}
          onCancel={() => setBackdateEntry(null)}
          onConfirm={(iso) => backdateEntryTime(backdateEntry.id, iso)}
        />
      )}
      {danger === 'all' && (
        <ConfirmDialog
          title="Delete all moments?"
          description="Every entry will be permanently erased. This cannot be undone."
          phrase="delete"
          confirmLabel="Delete everything"
          busy={dangerBusy}
          onCancel={() => setDanger(null)}
          onConfirm={handleDeleteAll}
        />
      )}
      {danger === 'account' && (
        <ConfirmDialog
          title="Delete your account?"
          description="Your account and all of its moments will be permanently erased. This cannot be undone."
          phrase="delete my account"
          confirmLabel="Delete account"
          busy={dangerBusy}
          onCancel={() => setDanger(null)}
          onConfirm={handleDeleteAccount}
        />
      )}

      {toast && (
        <ToastViewport position="bottom">
          <Toast tone={toast.tone} title={toast.title} action={toast.action} onDismiss={() => showToast(null)}>
            {toast.message}
          </Toast>
        </ToastViewport>
      )}

      <style>{`.searchhint:hover{border-color:var(--color-accent-primary);}`}</style>
    </div>
  );
}

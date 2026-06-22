// Auth gateway, wired to the API.
// Log in / register hit the backend; errors surface in the design-system voice.
// Password reset has no backend endpoint in this scope, so it stays an honest,
// non-functional notice (and never reveals whether an account exists).
import { useAuth } from '../auth/AuthContext.jsx';
import { api, ApiError } from '../api/client.js';

const { Logo, Button, TextField, StatusNote, Banner } = window.TRACE_UI;
const { useState, useEffect } = React;

// Turn an ApiError into one calm, non-leaky sentence.
function messageFor(err) {
  if (!(err instanceof ApiError)) return 'Something went wrong. Try again.';
  switch (err.code) {
    case 'INVALID_CREDENTIALS':
      return 'Email or password is incorrect.';
    case 'EMAIL_IN_USE':
      return 'That email is already registered. Try logging in.';
    case 'VALIDATION_ERROR':
      return 'Enter a valid email and a password of at least 8 characters.';
    case 'RATE_LIMITED':
      return err.message || 'Too many attempts. Wait a moment, then try again.';
    case 'NETWORK_ERROR':
      return err.message;
    default:
      return err.message || 'Something went wrong. Try again.';
  }
}

function AuthShell({ children, footer }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-base)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px var(--layout-gutter)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: 'min(380px, 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <Logo size={30} />
        </div>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '26px 24px',
          }}
        >
          {children}
        </div>
        {footer && (
          <div
            style={{
              textAlign: 'center',
              marginTop: 18,
              fontSize: 'var(--text-meta)',
              color: 'var(--color-text-muted)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function ScreenHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--weight-bold)',
          fontSize: 'var(--text-heading)',
          letterSpacing: 'var(--tracking-tight)',
          color: 'var(--color-text-primary)',
          margin: 0,
        }}
      >
        {title}
      </h1>
      {sub && (
        <p
          style={{
            fontSize: 'var(--text-meta)',
            color: 'var(--color-text-muted)',
            margin: '6px 0 0',
            lineHeight: 'var(--leading-normal)',
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function ModeLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        color: 'var(--color-accent-secondary)',
        fontFamily: 'var(--font-body)',
        fontSize: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

function ErrorNote({ error }) {
  if (!error) return null;
  return (
    <Banner tone="error" title="Couldn't continue">
      {error}
    </Banner>
  );
}

function LoginScreen({ onMode }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), pw);
      // On success the AuthProvider flips to authenticated and App swaps screens.
    } catch (err) {
      setError(messageFor(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ScreenHead title="Welcome back" sub="Your timeline is exactly where you left it." />
      <ErrorNote error={error} />
      <TextField
        autoFocus
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div>
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <div style={{ textAlign: 'right', marginTop: 6 }}>
          <span style={{ fontSize: 'var(--text-micro)' }}>
            <ModeLink onClick={() => onMode('reset')}>Forgot password?</ModeLink>
          </span>
        </div>
      </div>
      <Button variant="primary" type="submit" fullWidth iconRight="capture" disabled={busy}>
        {busy ? 'Logging in…' : 'Log in'}
      </Button>
    </form>
  );
}

function RegisterScreen({ onMode }) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const strong = pw.length >= 8;

  async function submit(e) {
    e.preventDefault();
    if (busy || !strong) return;
    setError(null);
    setBusy(true);
    try {
      await register(email.trim(), pw);
    } catch (err) {
      setError(messageFor(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ScreenHead
        title="Start your record"
        sub="One field at a time. Capture today; mine the patterns later."
      />
      <ErrorNote error={error} />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="at least 8 characters"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        hint={pw.length === 0 ? 'Stored hashed. We never see it.' : undefined}
        error={pw.length > 0 && !strong ? 'A little longer — 8 characters minimum.' : undefined}
      />
      {strong && <StatusNote tone="success">strong enough</StatusNote>}
      <Button variant="primary" type="submit" fullWidth disabled={busy || !strong}>
        {busy ? 'Creating account…' : 'Create account'}
      </Button>
      <p
        style={{
          fontSize: 'var(--text-micro)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          margin: 0,
          lineHeight: 'var(--leading-normal)',
        }}
      >
        Private by construction — strict per-user isolation, no content telemetry.
      </p>
    </form>
  );
}

function ResetScreen({ onMode, onUseToken }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  // In production the token arrives by email; with no mailer configured the
  // server returns it (non-production) so the reset is completable here.
  const [devToken, setDevToken] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setDevToken(res && res.devToken ? res.devToken : null);
      setSent(true);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ScreenHead title="Check your inbox" />
        <Banner tone="info" title="Reset link on its way">
          If an account exists for{' '}
          <strong style={{ color: 'var(--color-text-secondary)' }}>
            {email || 'that address'}
          </strong>
          , a reset link is on its way. It expires in 30 minutes.
        </Banner>
        {devToken ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <StatusNote tone="neutral">
              No mailer is configured on this server, so you can set a new password directly.
            </StatusNote>
            <Button variant="primary" fullWidth icon="capture" onClick={() => onUseToken(devToken)}>
              Set a new password now
            </Button>
          </div>
        ) : null}
        <Button variant="secondary" fullWidth onClick={() => onMode('login')} icon="restore">
          Back to log in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ScreenHead
        title="Reset password"
        sub="Enter your email and we'll send a one-time reset link."
      />
      <ErrorNote error={error} />
      <TextField
        autoFocus
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button variant="primary" type="submit" fullWidth icon="export" disabled={busy}>
        {busy ? 'Sending…' : 'Send reset link'}
      </Button>
      <div style={{ textAlign: 'center', fontSize: 'var(--text-meta)' }}>
        <ModeLink onClick={() => onMode('login')}>← back to log in</ModeLink>
      </div>
    </form>
  );
}

function SetPasswordScreen({ token, onMode }) {
  const { completePasswordReset } = useAuth();
  const [pw, setPw] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const strong = pw.length >= 8;

  async function submit(e) {
    e.preventDefault();
    if (busy || !strong) return;
    setError(null);
    setBusy(true);
    try {
      await completePasswordReset(token, pw);
      // Success flips to authenticated; App swaps to the timeline.
    } catch (err) {
      setError(messageFor(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ScreenHead title="Set a new password" sub="Choose a new password to finish resetting." />
      <ErrorNote error={error} />
      <TextField
        autoFocus
        label="New password"
        type="password"
        autoComplete="new-password"
        placeholder="at least 8 characters"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        error={pw.length > 0 && !strong ? 'A little longer — 8 characters minimum.' : undefined}
      />
      <Button variant="primary" type="submit" fullWidth disabled={busy || !strong}>
        {busy ? 'Saving…' : 'Reset password & sign in'}
      </Button>
      <div style={{ textAlign: 'center', fontSize: 'var(--text-meta)' }}>
        <ModeLink onClick={() => onMode('login')}>← back to log in</ModeLink>
      </div>
    </form>
  );
}

// A reset link lands as ?reset-token=...; pick it up and clear it from the URL.
function readResetTokenFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset-token');
    if (token) {
      params.delete('reset-token');
      const qs = params.toString();
      const url = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
      window.history.replaceState({}, '', url);
    }
    return token;
  } catch {
    return null;
  }
}

export function AuthScreen({ initialMode = 'login', onBack }) {
  const [urlToken] = useState(readResetTokenFromUrl);
  const [resetToken, setResetToken] = useState(urlToken || null);
  const [mode, setMode] = useState(urlToken ? 'set-password' : initialMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const useToken = (token) => {
    setResetToken(token);
    setMode('set-password');
  };

  const footers = {
    login: (
      <span>
        New to Trace? <ModeLink onClick={() => setMode('register')}>Create an account</ModeLink>
      </span>
    ),
    register: (
      <span>
        Already keep a record? <ModeLink onClick={() => setMode('login')}>Log in</ModeLink>
      </span>
    ),
    reset: null,
    'set-password': null,
  };

  const footer = (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      {footers[mode]}
      {onBack && <ModeLink onClick={onBack}>← back to home</ModeLink>}
    </span>
  );

  return (
    <AuthShell footer={footer}>
      {mode === 'login' && <LoginScreen onMode={setMode} />}
      {mode === 'register' && <RegisterScreen onMode={setMode} />}
      {mode === 'reset' && <ResetScreen onMode={setMode} onUseToken={useToken} />}
      {mode === 'set-password' && <SetPasswordScreen token={resetToken} onMode={setMode} />}
    </AuthShell>
  );
}

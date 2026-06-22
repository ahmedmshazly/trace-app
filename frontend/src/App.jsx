// Top-level app: provides session state and routes between the auth gateway and
// the capture/timeline app. Mounted by src/main.jsx after the design-system
// bundle and global React are ready.
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import { LandingScreen } from './screens/LandingScreen.jsx';
import { AuthScreen } from './screens/AuthScreen.jsx';
import { AppScreen } from './screens/AppScreen.jsx';

const { useEffect, useState, createElement } = React;

function BootSplash() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-base)',
        color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-micro)',
      }}
    >
      restoring your session…
    </div>
  );
}

function Routes() {
  const { isLoading, isAuthenticated } = useAuth();
  // Unauthenticated flow: public landing -> auth gateway. `authMode` carries the
  // visitor's intent (Start your trace -> register, Log in -> login). A reset
  // link (?reset-token=...) skips the landing page and opens the gateway.
  const hasResetToken = (() => {
    try {
      return new URLSearchParams(window.location.search).has('reset-token');
    } catch {
      return false;
    }
  })();
  const [view, setView] = useState(hasResetToken ? 'auth' : 'landing');
  const [authMode, setAuthMode] = useState('login');

  if (isLoading) return <BootSplash />;
  if (isAuthenticated) return <AppScreen />;

  if (view === 'landing') {
    return (
      <LandingScreen
        onStart={() => { setAuthMode('register'); setView('auth'); }}
        onLogin={() => { setAuthMode('login'); setView('auth'); }}
      />
    );
  }

  return <AuthScreen initialMode={authMode} onBack={() => setView('landing')} />;
}

function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export function mountApp(container) {
  const root = ReactDOM.createRoot(container);
  root.render(createElement(App));
  return root;
}

// Session state: holds the current user, persists the JWT, restores the session
// on reload, and clears it on any 401. Built on the global React provided by the
// design-system bundle (see src/main.jsx).
import { api, getToken, setToken, onUnauthorized } from '../api/client.js';

const { createContext, useContext, useState, useEffect, useCallback, createElement } = React;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "loading" while we restore an existing token; gates the first render so we
  // don't flash the gateway for an already-signed-in user.
  const [status, setStatus] = useState(getToken() ? 'loading' : 'anonymous');

  const signOutLocal = useCallback(() => {
    setToken(null);
    setUser(null);
    setStatus('anonymous');
  }, []);

  useEffect(() => onUnauthorized(signOutLocal), [signOutLocal]);

  useEffect(() => {
    if (status !== 'loading') return;
    let cancelled = false;
    api
      .me()
      .then((profile) => {
        if (cancelled) return;
        setUser(profile);
        setStatus('authenticated');
      })
      .catch(() => {
        if (cancelled) return;
        // onUnauthorized already clears on 401; this covers other failures.
        signOutLocal();
      });
    return () => {
      cancelled = true;
    };
  }, [status, signOutLocal]);

  const login = useCallback(async (email, password) => {
    const { token, user: profile } = await api.login(email, password);
    setToken(token);
    setUser(profile);
    setStatus('authenticated');
    return profile;
  }, []);

  const register = useCallback(async (email, password) => {
    const { token, user: profile } = await api.register(email, password);
    setToken(token);
    setUser(profile);
    setStatus('authenticated');
    return profile;
  }, []);

  // Completes a password reset and signs the user in with the fresh token.
  const completePasswordReset = useCallback(async (resetToken, password) => {
    const { token, user: profile } = await api.resetPassword(resetToken, password);
    setToken(token);
    setUser(profile);
    setStatus('authenticated');
    return profile;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* logout is best-effort; the token is dropped locally regardless */
    }
    signOutLocal();
  }, [signOutLocal]);

  const value = {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    login,
    register,
    logout,
    completePasswordReset,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

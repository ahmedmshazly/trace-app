// Session state: holds the current user, persists the JWT, restores the session
// on reload, and clears it on any 401. Built on the global React provided by the
// design-system bundle (see src/main.tsx).
import { api, getToken, setToken, onUnauthorized } from '../api/client';
import type { ReactNode } from 'react';

const { createContext, useContext, useState, useEffect, useCallback, createElement } = React;

export interface AuthUser {
  id: string;
  email: string;
  createdAt?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  status: 'loading' | 'anonymous' | 'authenticated';
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  completePasswordReset: (resetToken: string, password: string) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // "loading" while we restore an existing token; gates the first render so we
  // don't flash the gateway for an already-signed-in user.
  const [status, setStatus] = useState<'loading' | 'anonymous' | 'authenticated'>(
    getToken() ? 'loading' : 'anonymous',
  );

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
        setUser(profile as AuthUser);
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

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: profile } = await api.login(email, password);
    setToken(token);
    setUser(profile);
    setStatus('authenticated');
    return profile as AuthUser;
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const { token, user: profile } = await api.register(email, password);
    setToken(token);
    setUser(profile);
    setStatus('authenticated');
    return profile as AuthUser;
  }, []);

  // Completes a password reset and signs the user in with the fresh token.
  const completePasswordReset = useCallback(async (resetToken: string, password: string) => {
    const { token, user: profile } = await api.resetPassword(resetToken, password);
    setToken(token);
    setUser(profile);
    setStatus('authenticated');
    return profile as AuthUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* logout is best-effort; the token is dropped locally regardless */
    }
    signOutLocal();
  }, [signOutLocal]);

  const value: AuthContextValue = {
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

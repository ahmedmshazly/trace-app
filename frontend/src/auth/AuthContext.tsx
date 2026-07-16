// Session state: holds the current user, restores the session via the httpOnly
// cookie on reload, and clears local UI state on any 401. Built on the global
// React provided by the design-system bundle (see src/main.tsx).
import { api, onUnauthorized } from '../api/client';
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
  // Always probe /auth/me on boot — the httpOnly cookie is not readable from JS.
  const [status, setStatus] = useState<'loading' | 'anonymous' | 'authenticated'>('loading');

  const signOutLocal = useCallback(() => {
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
        signOutLocal();
      });
    return () => {
      cancelled = true;
    };
  }, [status, signOutLocal]);

  const login = useCallback(async (email: string, password: string) => {
    const { user: profile } = await api.login(email, password);
    setUser(profile);
    setStatus('authenticated');
    return profile as AuthUser;
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const { user: profile } = await api.register(email, password);
    setUser(profile);
    setStatus('authenticated');
    return profile as AuthUser;
  }, []);

  // Completes a password reset and signs the user in with the fresh session cookie.
  const completePasswordReset = useCallback(async (resetToken: string, password: string) => {
    const { user: profile } = await api.resetPassword(resetToken, password);
    setUser(profile);
    setStatus('authenticated');
    return profile as AuthUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* logout is best-effort; local UI clears regardless */
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

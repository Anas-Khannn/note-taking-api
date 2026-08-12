"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { SESSION_VALIDATION_ENABLED } from "@/lib/auth-config";
import {
  AUTH_CHANGE_EVENT,
  notifyAuthChanged,
} from "@/lib/auth-events";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  saveAuthSession,
  updateStoredUser,
} from "@/lib/auth-storage";
import { getCurrentUser } from "@/services/auth.service";
import type { AuthContextValue, AuthSession, AuthUser } from "@/types/auth.types";

// Sentinel returned only during server rendering and hydration. It lets the
// provider show an initializing state instead of a false logged-out one.
const UNINITIALIZED = "memonest:uninitialized";

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}

// Returns a stable string snapshot so useSyncExternalStore's Object.is
// comparison stays stable across renders. Reads localStorage on the client
// only; never at module scope and never during server rendering.
function readStoredSession(): string {
  const token = getStoredToken();
  const user = getStoredUser();

  if (token && user) {
    return JSON.stringify({ token, user });
  }
  if (token || user) {
    // Incomplete session: drop both halves so a broken one is never restored.
    clearAuthSession();
  }
  return "";
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const snapshot = useSyncExternalStore(
    subscribe,
    readStoredSession,
    () => UNINITIALIZED
  );

  const { user, token, isInitializing } = useMemo(() => {
    if (snapshot === UNINITIALIZED) {
      return { user: null, token: null, isInitializing: true };
    }
    if (snapshot) {
      try {
        const parsed = JSON.parse(snapshot) as {
          token: string;
          user: AuthUser;
        };
        if (parsed.token && parsed.user) {
          return {
            user: parsed.user,
            token: parsed.token,
            isInitializing: false,
          };
        }
      } catch {
        // Fall through to the logged-out state; malformed values are already
        // removed by the storage helpers.
      }
    }
    return { user: null, token: null, isInitializing: false };
  }, [snapshot]);

  // Backend-backed session validation. Only active when the backend exposes
  // GET /api/auth/me (SESSION_VALIDATION_ENABLED). When inactive, the storage
  // snapshot is trusted, matching today's no-auth backend. When active, the
  // stored token is checked against the server before the session is shown,
  // and invalid/expired data is cleared. `validatedToken` tracks the token
  // that has finished server validation, so a fresh token is reported as
  // "restoring" until its check resolves.
  const [validatedToken, setValidatedToken] = useState<string | null>(null);

  useEffect(() => {
    if (!SESSION_VALIDATION_ENABLED || isInitializing || !token) {
      return;
    }

    let cancelled = false;

    getCurrentUser()
      .then((freshUser) => {
        if (cancelled) return;
        saveAuthSession({ token, user: freshUser });
        notifyAuthChanged();
      })
      .catch(() => {
        if (cancelled) return;
        clearAuthSession();
        notifyAuthChanged();
      })
      .finally(() => {
        if (!cancelled) {
          setValidatedToken(token);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isInitializing, token]);

  const restoringSession =
    SESSION_VALIDATION_ENABLED &&
    Boolean(token) &&
    token !== validatedToken;

  const effectiveInitializing = isInitializing || restoringSession;

  const login = useCallback((session: AuthSession) => {
    saveAuthSession(session);
    notifyAuthChanged();
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    notifyAuthChanged();
    // Drop any user-specific cached data so nothing leaks across sessions.
    queryClient.clear();
  }, [queryClient]);

  const setUser = useCallback((nextUser: AuthUser) => {
    updateStoredUser(nextUser);
    notifyAuthChanged();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isInitializing: effectiveInitializing,
      login,
      logout,
      setUser,
    }),
    [user, token, effectiveInitializing, login, logout, setUser]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

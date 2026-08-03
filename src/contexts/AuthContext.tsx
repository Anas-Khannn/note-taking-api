"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  saveAuthSession,
} from "@/lib/auth-storage";
import type { AuthContextValue, AuthSession, AuthUser } from "@/types/auth";

// Sentinel returned only during server rendering and hydration. It lets the
// provider show an initializing state instead of a false logged-out one.
const UNINITIALIZED = "memonest:uninitialized";

const AUTH_CHANGE_EVENT = "memonest:auth-change";

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

  const login = useCallback((session: AuthSession) => {
    saveAuthSession(session);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    // Drop any user-specific cached data so nothing leaks across sessions.
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isInitializing,
      login,
      logout,
    }),
    [user, token, isInitializing, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

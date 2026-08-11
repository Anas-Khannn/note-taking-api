import type { AuthSession, AuthUser } from "@/types/auth";

// Namespaced storage keys shared across the auth layer.
export const AUTH_STORAGE_KEYS = {
  token: "memonest_auth_token",
  user: "memonest_auth_user",
} as const;

// Token persistence lives in localStorage because this module explicitly
// requires it. HttpOnly cookies are generally safer where the backend
// supports them, and should be preferred when auth endpoints are added.
// localStorage is never read during server rendering, and passwords are
// never written here.

function canUseStorage(): boolean {
  return typeof window !== "undefined" && "localStorage" in window;
}

function readStoredValue(key: string): string | null {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStoredValue(key: string, value: string): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore quota / privacy-mode failures.
  }
}

function removeStoredValue(key: string): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage access failures.
  }
}

export function getStoredToken(): string | null {
  const token = readStoredValue(AUTH_STORAGE_KEYS.token);
  return token && token.trim().length > 0 ? token : null;
}

export function getStoredUser(): AuthUser | null {
  const raw = readStoredValue(AUTH_STORAGE_KEYS.user);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as AuthUser).user_id === "string" &&
      typeof (parsed as AuthUser).name === "string" &&
      typeof (parsed as AuthUser).email === "string"
    ) {
      return parsed as AuthUser;
    }
  } catch {
    // Fall through and clear the malformed value below.
  }

  removeStoredValue(AUTH_STORAGE_KEYS.user);
  return null;
}

export function saveAuthSession(session: AuthSession): void {
  writeStoredValue(AUTH_STORAGE_KEYS.token, session.token);
  writeStoredValue(AUTH_STORAGE_KEYS.user, JSON.stringify(session.user));
}

export function updateStoredUser(user: AuthUser): void {
  writeStoredValue(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
}

export function clearAuthSession(): void {
  removeStoredValue(AUTH_STORAGE_KEYS.token);
  removeStoredValue(AUTH_STORAGE_KEYS.user);
}

import { describe, expect, it } from "vitest";

import {
  AUTH_STORAGE_KEYS,
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  saveAuthSession,
} from "@/lib/auth-storage";
import type { AuthSession, AuthUser } from "@/types/auth.types";

const user: AuthUser = {
  user_id: "u_123",
  name: "Ada Lovelace",
  email: "ada@example.com",
};

const session: AuthSession = {
  token: "token-abc-123",
  user,
};

describe("auth-storage", () => {
  describe("saveAuthSession", () => {
    it("persists the token and user under namespaced keys", () => {
      saveAuthSession(session);

      expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBe(
        session.token
      );
      expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBe(
        JSON.stringify(user)
      );
    });
  });

  describe("getStoredToken", () => {
    it("returns null when nothing is stored", () => {
      expect(getStoredToken()).toBeNull();
    });

    it("returns the stored token", () => {
      window.localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token);

      expect(getStoredToken()).toBe(session.token);
    });

    it("returns null for an empty or whitespace-only token", () => {
      window.localStorage.setItem(AUTH_STORAGE_KEYS.token, "   ");

      expect(getStoredToken()).toBeNull();
    });
  });

  describe("getStoredUser", () => {
    it("returns null when nothing is stored", () => {
      expect(getStoredUser()).toBeNull();
    });

    it("parses and returns the stored user", () => {
      window.localStorage.setItem(
        AUTH_STORAGE_KEYS.user,
        JSON.stringify(user)
      );

      expect(getStoredUser()).toEqual(user);
    });

    it("removes a malformed JSON value and returns null", () => {
      window.localStorage.setItem(AUTH_STORAGE_KEYS.user, "{not-json");

      expect(getStoredUser()).toBeNull();
      expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
    });

    it("removes a value that is not shaped like an AuthUser", () => {
      window.localStorage.setItem(
        AUTH_STORAGE_KEYS.user,
        JSON.stringify({ user_id: "u_123" })
      );

      expect(getStoredUser()).toBeNull();
      expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
    });
  });

  describe("clearAuthSession", () => {
    it("removes both the token and the user", () => {
      saveAuthSession(session);
      expect(getStoredToken()).not.toBeNull();
      expect(getStoredUser()).not.toBeNull();

      clearAuthSession();

      expect(getStoredToken()).toBeNull();
      expect(getStoredUser()).toBeNull();
    });
  });

  describe("round-trip", () => {
    it("returns the exact session written by saveAuthSession", () => {
      saveAuthSession(session);

      expect(getStoredToken()).toBe(session.token);
      expect(getStoredUser()).toEqual(user);
    });
  });
});

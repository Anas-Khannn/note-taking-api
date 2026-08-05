import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import {
  AuthBackendUnavailableError,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "@/services/auth.service";
import type { LoginInput, RegisterInput } from "@/types/auth";

const loginInput: LoginInput = {
  email: "ada@example.com",
  password: "password123",
};

const registerInput: RegisterInput = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "password123",
};

// The MemoNest backend now exposes every auth route except refresh. These
// tests lock in the live contract: real endpoints reach the network, and the
// one route the backend does not implement still fails fast with a clear error
// instead of fabricating a response.
describe("auth.service endpoint availability", () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");

  const liveCalls: Array<[string, () => Promise<unknown>]> = [
    ["loginUser", () => loginUser(loginInput)],
    ["registerUser", () => registerUser(registerInput)],
    ["logoutUser", () => logoutUser()],
    ["getCurrentUser", () => getCurrentUser()],
    [
      "requestPasswordReset",
      () => requestPasswordReset({ email: loginInput.email }),
    ],
    [
      "resetPassword",
      () => resetPassword({ token: "reset-token", password: loginInput.password }),
    ],
  ];

  afterEach(() => {
    fetchSpy.mockClear();
  });

  it.each(liveCalls)(
    "%s attempts a real network request and surfaces transport errors",
    async (_name, call) => {
      fetchSpy.mockRejectedValueOnce(new TypeError("network down"));

      await expect(call()).rejects.toBeInstanceOf(ApiError);
      expect(fetchSpy).toHaveBeenCalled();
    }
  );

  it("refreshToken is unavailable and never reaches the network", async () => {
    await expect(refreshToken()).rejects.toBeInstanceOf(
      AuthBackendUnavailableError
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("describes the missing refresh route on the error", async () => {
    await expect(refreshToken()).rejects.toMatchObject({
      name: "AuthBackendUnavailableError",
      endpoint: "/auth/refresh",
      method: "POST",
    });
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

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

// The MemoNest backend does not expose auth routes yet, so every endpoint is
// disabled. These tests lock in the current contract: a clear error is thrown
// and no network request is ever attempted.
describe("auth.service endpoint availability", () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");

  const calls: Array<[string, () => Promise<unknown>]> = [
    ["loginUser", () => loginUser(loginInput)],
    ["registerUser", () => registerUser(registerInput)],
    ["logoutUser", () => logoutUser()],
    ["getCurrentUser", () => getCurrentUser()],
    ["refreshToken", () => refreshToken()],
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

  it.each(calls)("%s rejects with AuthBackendUnavailableError", async (_name, call) => {
    await expect(call()).rejects.toBeInstanceOf(AuthBackendUnavailableError);
  });

  it.each(calls)("%s never reaches the network", async (_name, call) => {
    await expect(call()).rejects.toBeInstanceOf(AuthBackendUnavailableError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("describes the missing route on the error", async () => {
    await expect(loginUser(loginInput)).rejects.toMatchObject({
      name: "AuthBackendUnavailableError",
      endpoint: "/auth/login",
      method: "POST",
    });
    await expect(requestPasswordReset({ email: loginInput.email })).rejects.toMatchObject({
      endpoint: "/auth/forgot-password",
      method: "POST",
    });
  });
});

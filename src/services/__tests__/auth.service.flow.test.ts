import { beforeEach, describe, expect, it, vi } from "vitest";

const apiRequest = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api", () => {
  class ApiError extends Error {
    readonly status: number;
    readonly code?: string;

    constructor(message: string, status: number, code?: string) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.code = code;
    }
  }
  return { ApiError, apiRequest };
});

// Flip every auth endpoint to "available" so the request/parse flow can be
// exercised against a mocked API client.
vi.mock("@/lib/auth-config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth-config")>();
  return {
    ...actual,
    AUTH_ENDPOINT_AVAILABILITY: {
      register: true,
      login: true,
      logout: true,
      me: true,
      refresh: true,
      forgotPassword: true,
      resetPassword: true,
    } as typeof actual.AUTH_ENDPOINT_AVAILABILITY,
  };
});

import { ApiError } from "@/lib/api";
import {
  getCurrentUser,
  isRegisterSession,
  loginUser,
  logoutUser,
  parseAuthSession,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "@/services/auth.service";
import type { AuthUser } from "@/types/auth";

const user: AuthUser = {
  user_id: "u_123",
  name: "Ada Lovelace",
  email: "ada@example.com",
};

const credentials = { email: user.email, password: "password123" };

const sessionPayload = {
  data: { token: "token-abc", user },
};

beforeEach(() => {
  apiRequest.mockReset();
});

describe("loginUser", () => {
  it("posts the credentials and returns the parsed session", async () => {
    apiRequest.mockResolvedValueOnce(sessionPayload);

    const session = await loginUser(credentials);

    expect(apiRequest).toHaveBeenCalledWith(
      "/auth/login",
      expect.objectContaining({
        method: "POST",
        auth: false,
        body: JSON.stringify(credentials),
      })
    );
    expect(session).toEqual({ token: "token-abc", user });
  });

  it("propagates errors returned by the backend", async () => {
    apiRequest.mockRejectedValueOnce(new ApiError("Invalid credentials", 401));

    await expect(loginUser(credentials)).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Invalid credentials",
    });
  });

  it("rejects an invalid response payload", async () => {
    apiRequest.mockResolvedValueOnce({ data: { token: "token-abc" } });

    await expect(loginUser(credentials)).rejects.toMatchObject({
      name: "ApiError",
      code: "INVALID_AUTH_RESPONSE",
    });
  });
});

describe("registerUser", () => {
  const registerInput = {
    name: "Ada Lovelace",
    email: user.email,
    password: "password123",
  };

  it("returns a verification-required result when the backend asks for it", async () => {
    apiRequest.mockResolvedValueOnce({
      data: { requiresVerification: true, message: "Check your email." },
    });

    const result = await registerUser(registerInput);

    expect(result).toEqual({
      requiresVerification: true,
      message: "Check your email.",
    });
    expect(isRegisterSession(result)).toBe(false);
  });

  it("uses the default message when verification omits one", async () => {
    apiRequest.mockResolvedValueOnce({
      data: { requiresVerification: true },
    });

    const result = await registerUser(registerInput);

    expect(result).toEqual({
      requiresVerification: true,
      message: "Check your email to verify your account.",
    });
  });

  it("returns a session when the backend logs the user in immediately", async () => {
    apiRequest.mockResolvedValueOnce(sessionPayload);

    const result = await registerUser(registerInput);

    expect(isRegisterSession(result)).toBe(true);
    if (isRegisterSession(result)) {
      expect(result.token).toBe("token-abc");
    }
  });
});

describe("getCurrentUser", () => {
  it("returns the parsed user from the data envelope", async () => {
    apiRequest.mockResolvedValueOnce({ data: user });

    await expect(getCurrentUser()).resolves.toEqual(user);
  });

  it("rejects an invalid user payload", async () => {
    apiRequest.mockResolvedValueOnce({ data: { user_id: "u_123" } });

    await expect(getCurrentUser()).rejects.toMatchObject({
      name: "ApiError",
      code: "INVALID_AUTH_RESPONSE",
    });
  });
});

describe("logoutUser", () => {
  it("calls the logout endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ success: true });

    await logoutUser();

    expect(apiRequest).toHaveBeenCalledWith(
      "/auth/logout",
      expect.objectContaining({ method: "POST" })
    );
  });
});

describe("requestPasswordReset", () => {
  it("posts the email and surfaces the backend message", async () => {
    apiRequest.mockResolvedValueOnce({
      success: true,
      message: "Password reset instructions have been prepared.",
    });

    const result = await requestPasswordReset({ email: user.email });

    expect(result).toEqual({
      message: "Password reset instructions have been prepared.",
    });
    expect(apiRequest).toHaveBeenCalledWith(
      "/auth/forgot-password",
      expect.objectContaining({ method: "POST", auth: false })
    );
  });

  it("falls back to a neutral message when the backend omits one", async () => {
    apiRequest.mockResolvedValueOnce({ success: true });

    const result = await requestPasswordReset({ email: user.email });

    expect(result).toEqual({
      message:
        "If an account exists for that email, password reset instructions have been prepared.",
    });
  });
});

describe("resetPassword", () => {
  it("posts the token and new password and returns the backend message", async () => {
    apiRequest.mockResolvedValueOnce({
      success: true,
      message: "Your password has been reset successfully",
    });

    const result = await resetPassword({
      token: "reset-token",
      password: "password123",
    });

    expect(result).toEqual({
      message: "Your password has been reset successfully",
    });
    expect(apiRequest).toHaveBeenCalledWith(
      "/auth/reset-password",
      expect.objectContaining({ method: "POST", auth: false })
    );
  });
});

describe("parseAuthSession", () => {
  it("parses a session from the { success, message, data } envelope", () => {
    expect(parseAuthSession(sessionPayload)).toEqual({
      token: "token-abc",
      user,
    });
  });

  it("parses a session from a direct payload", () => {
    expect(parseAuthSession({ token: "token-abc", user })).toEqual({
      token: "token-abc",
      user,
    });
  });

  it.each([
    [{ data: { user } }, "missing token"],
    [{ data: { token: "token-abc" } }, "missing user"],
    [{ data: { token: "", user } }, "empty token"],
    [null, "null payload"],
  ])("rejects an invalid payload (%s)", async (payload, _label) => {
    expect(() => parseAuthSession(payload)).toThrow(
      "The authentication response from the server was invalid."
    );
  });
});

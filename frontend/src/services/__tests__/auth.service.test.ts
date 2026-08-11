import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_STORAGE_KEYS } from "@/lib/auth-storage";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updateProfile,
} from "@/services/auth.service";
import type { AuthUser, LoginInput, RegisterInput } from "@/types/auth";

const user: AuthUser = {
  user_id: "u_123",
  name: "Ada Lovelace",
  email: "ada@example.com",
};

const loginInput: LoginInput = {
  email: "ada@example.com",
  password: "password123",
};

const registerInput: RegisterInput = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "password123",
};

const sessionPayload = {
  success: true,
  message: "Login successful",
  data: { user, token: "token-abc" },
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// The MemoNest backend exposes the auth routes, so the service issues real
// requests. These tests exercise the full service + API-client path against a
// mocked fetch and lock in the response envelope contract.
describe("auth.service network contract", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loginUser posts credentials to /auth/login and parses the session", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(sessionPayload));

    const session = await loginUser(loginInput);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/auth\/login$/);
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).body).toBe(JSON.stringify(loginInput));
    expect(new Headers((init as RequestInit).headers).has("Authorization")).toBe(false);
    expect(session).toEqual({ token: "token-abc", user });
  });

  it("registerUser posts to /auth/register and returns the session", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(sessionPayload));

    const result = await registerUser(registerInput);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/auth\/register$/);
    expect((init as RequestInit).body).toBe(JSON.stringify(registerInput));
    expect(result).toEqual({ token: "token-abc", user });
  });

  it("getCurrentUser calls /auth/me with the bearer token", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, "token-abc");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: true, message: "User retrieved successfully", data: user })
    );

    const current = await getCurrentUser();

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/auth\/me$/);
    expect(new Headers((init as RequestInit).headers).get("Authorization")).toBe(
      "Bearer token-abc"
    );
    expect(current).toEqual(user);
  });

  it("logoutUser posts to /auth/logout", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, message: "Logged out successfully" }));

    await logoutUser();

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/auth\/logout$/);
    expect((init as RequestInit).method).toBe("POST");
  });

  it("updateProfile patches /auth/profile with JSON and parses the user", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, "token-abc");
    const updatedUser = { ...user, name: "Ada Lovelace II" };
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        message: "Profile updated successfully",
        data: { user: updatedUser },
      })
    );

    const result = await updateProfile({ name: "Ada Lovelace II" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/auth\/profile$/);
    expect((init as RequestInit).method).toBe("PATCH");
    expect((init as RequestInit).body).toBe(
      JSON.stringify({ name: "Ada Lovelace II" })
    );
    expect(new Headers((init as RequestInit).headers).get("Authorization")).toBe(
      "Bearer token-abc"
    );
    expect(result).toEqual(updatedUser);
  });

  it("updateProfile sends the photo as multipart form data", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, "token-abc");
    const file = new File(["image-bytes"], "avatar.png", { type: "image/png" });
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          user: { ...user, profile_image_url: "/uploads/profile/avatar.png" },
        },
      })
    );

    const result = await updateProfile({ profileImage: file });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/auth\/profile$/);
    expect((init as RequestInit).method).toBe("PATCH");
    expect((init as RequestInit).body).toBeInstanceOf(FormData);
    expect(
      new Headers((init as RequestInit).headers).get("Content-Type")
    ).toBeNull();
    expect(result.profile_image_url).toBe("/uploads/profile/avatar.png");
  });

  it("updateProfile sends removeProfileImage as a JSON boolean", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, "token-abc");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          user: { ...user, profile_image_url: null },
        },
      })
    );

    const result = await updateProfile({ removeProfileImage: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/auth\/profile$/);
    expect((init as RequestInit).body).toBe(
      JSON.stringify({ removeProfileImage: true })
    );
    expect(result.profile_image_url).toBeNull();
  });

  it("requestPasswordReset posts the email to /auth/forgot-password", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }));

    const result = await requestPasswordReset({ email: user.email });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/auth\/forgot-password$/);
    expect((init as RequestInit).body).toBe(JSON.stringify({ email: user.email }));
    expect(result.message.length).toBeGreaterThan(0);
  });

  it("resetPassword posts the token and password to /auth/reset-password", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }));

    const result = await resetPassword({ token: "reset-token", password: "password123" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/auth\/reset-password$/);
    expect((init as RequestInit).body).toBe(
      JSON.stringify({ token: "reset-token", password: "password123" })
    );
    expect(result.message.length).toBeGreaterThan(0);
  });

  it("surfaces the backend error message", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: false, message: "Invalid email or password" }, 401)
    );

    await expect(loginUser(loginInput)).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Invalid email or password",
    });
  });
});

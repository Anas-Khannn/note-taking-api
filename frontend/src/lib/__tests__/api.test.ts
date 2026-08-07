import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { redirectToLogin } from "@/lib/auth-redirect";
import { AUTH_STORAGE_KEYS } from "@/lib/auth-storage";

vi.mock("@/lib/auth-redirect", () => ({
  redirectToLogin: vi.fn(),
}));

// Imported after the mock so the mocked redirect binding is used by api.ts.
import { apiRequest } from "@/lib/api";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function seedSession() {
  window.localStorage.setItem(AUTH_STORAGE_KEYS.token, "token-abc");
  window.localStorage.setItem(
    AUTH_STORAGE_KEYS.user,
    JSON.stringify({ id: "u_123", name: "Ada Lovelace", email: "ada@example.com" })
  );
}

beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(redirectToLogin).mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiRequest 401 handling", () => {
  it("clears the session, notifies the auth layer, and redirects on an authenticated 401", async () => {
    seedSession();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({ success: false, message: "Invalid or expired authentication token" }, 401)
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/note")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Invalid or expired authentication token",
    });

    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });

  it("does not touch the session for a 401 on an unauthenticated request (e.g. login)", async () => {
    seedSession();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({ success: false, message: "Invalid email or password" }, 401)
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiRequest("/auth/login", { method: "POST", auth: false })
    ).rejects.toMatchObject({ name: "ApiError", status: 401 });

    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBe("token-abc");
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it("does not clear the session or redirect for a non-401 error", async () => {
    seedSession();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({ success: false, message: "Internal server error" }, 500)
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/note")).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
    });

    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBe("token-abc");
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it("surfaces network failures as a NETWORK_ERROR ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(new TypeError("Failed to fetch"))
    );

    await expect(apiRequest("/note")).rejects.toMatchObject({
      name: "ApiError",
      status: 0,
      code: "NETWORK_ERROR",
    });
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it("throws an ApiError with the status code when the backend sends no message", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({ success: false }, 403)
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/note")).rejects.toMatchObject({
      name: "ApiError",
      status: 403,
    });
  });
});

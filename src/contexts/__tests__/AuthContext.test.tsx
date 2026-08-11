import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_STORAGE_KEYS } from "@/lib/auth-storage";
import { getCurrentUser } from "@/services/auth.service";
import type { AuthSession, AuthUser } from "@/types/auth";

vi.mock("@/services/auth.service", () => ({
  getCurrentUser: vi.fn(),
}));

const user: AuthUser = {
  user_id: "u_123",
  name: "Ada Lovelace",
  email: "ada@example.com",
};

const session: AuthSession = { token: "token-abc", user };

const mockGetCurrentUser = vi.mocked(getCurrentUser);

function Probe() {
  const { isAuthenticated, isInitializing, user: currentUser, token, login, logout } = useAuth();

  return (
    <div>
      <output data-testid="auth-state">
        {JSON.stringify({
          isAuthenticated,
          isInitializing,
          user: currentUser,
          token,
        })}
      </output>
      <button type="button" onClick={() => login(session)}>
        Log in
      </button>
      <button type="button" onClick={() => logout()}>
        Log out
      </button>
    </div>
  );
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{ui}</AuthProvider>
    </QueryClientProvider>
  );
}

function readState(): {
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: AuthUser | null;
  token: string | null;
} {
  return JSON.parse(screen.getByTestId("auth-state").textContent ?? "null");
}

beforeEach(() => {
  mockGetCurrentUser.mockReset();
  // A stored session is trusted only after GET /api/auth/me succeeds.
  mockGetCurrentUser.mockResolvedValue(user);
});

describe("AuthProvider", () => {
  it("starts unauthenticated and not initializing when nothing is stored", () => {
    renderWithProviders(<Probe />);

    expect(readState()).toEqual({
      isAuthenticated: false,
      isInitializing: false,
      user: null,
      token: null,
    });
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
  });

  it("logs in: updates the session, persists it, and keeps it after validation", async () => {
    const userEventSetup = userEvent.setup();
    renderWithProviders(<Probe />);

    await userEventSetup.click(screen.getByRole("button", { name: "Log in" }));

    expect(readState().isAuthenticated).toBe(true);
    expect(readState().user).toEqual(user);
    expect(readState().token).toBe(session.token);
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBe(session.token);
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBe(JSON.stringify(user));
  });

  it("logs out: clears the session and the persisted values", async () => {
    const userEventSetup = userEvent.setup();
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token);
    window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));

    renderWithProviders(<Probe />);
    await screen.findByText(/isInitializing":false/);

    await userEventSetup.click(screen.getByRole("button", { name: "Log out" }));

    expect(readState().isAuthenticated).toBe(false);
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
  });

  it("restores a persisted session only after /me validation succeeds", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token);
    window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));

    renderWithProviders(<Probe />);

    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(readState().isAuthenticated).toBe(true));
    expect(readState()).toEqual({
      isAuthenticated: true,
      isInitializing: false,
      user,
      token: session.token,
    });
  });

  it("clears an invalid or expired stored session when /me fails", async () => {
    mockGetCurrentUser.mockRejectedValueOnce(new Error("token expired"));
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token);
    window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));

    renderWithProviders(<Probe />);

    await waitFor(() => expect(readState().isAuthenticated).toBe(false));
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
  });

  it("drops an incomplete session instead of restoring it", () => {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token);

    renderWithProviders(<Probe />);

    expect(readState().isAuthenticated).toBe(false);
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
  });
});

describe("useAuth", () => {
  it("throws when used outside an AuthProvider", () => {
    const queryClient = new QueryClient();
    expect(() =>
      render(
        <QueryClientProvider client={queryClient}>
          <Probe />
        </QueryClientProvider>
      )
    ).toThrow("useAuth must be used within an AuthProvider");
  });
});

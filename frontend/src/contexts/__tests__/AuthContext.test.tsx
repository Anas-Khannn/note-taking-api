import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_STORAGE_KEYS } from "@/lib/auth-storage";
import type { AuthSession, AuthUser } from "@/types/auth";

const getCurrentUserMock = vi.hoisted(() => vi.fn());

vi.mock("@/services/auth.service", () => ({
  getCurrentUser: getCurrentUserMock,
}));

const user: AuthUser = {
  id: "u_123",
  name: "Ada Lovelace",
  email: "ada@example.com",
};

const updatedUser: AuthUser = {
  id: "u_123",
  name: "Grace Hopper",
  email: "ada@example.com",
  profileImageUrl: "/uploads/profile/grace.png",
};

const session: AuthSession = { token: "token-abc", user };

function Probe() {
  const {
    isAuthenticated,
    isInitializing,
    user: currentUser,
    token,
    login,
    logout,
    setUser,
  } = useAuth();

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
      <button type="button" onClick={() => setUser(updatedUser)}>
        Update user
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
  getCurrentUserMock.mockReset();
  getCurrentUserMock.mockResolvedValue(user);
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
  });

  it("logs in: updates the session and persists it to storage", async () => {
    const userEventSetup = userEvent.setup();
    renderWithProviders(<Probe />);

    await userEventSetup.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(readState()).toEqual({
        isAuthenticated: true,
        isInitializing: false,
        user,
        token: session.token,
      });
    });
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBe(session.token);
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBe(JSON.stringify(user));
  });

  it("logs out: clears the session and the persisted values", async () => {
    const userEventSetup = userEvent.setup();
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token);
    window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));

    renderWithProviders(<Probe />);
    await waitFor(() => {
      expect(readState().isAuthenticated).toBe(true);
    });

    await userEventSetup.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(readState().isAuthenticated).toBe(false);
    });
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
  });

  it("setUser updates the context user and the persisted session", async () => {
    const userEventSetup = userEvent.setup();
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token);
    window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));

    renderWithProviders(<Probe />);
    await waitFor(() => {
      expect(readState().isAuthenticated).toBe(true);
    });

    await userEventSetup.click(screen.getByRole("button", { name: "Update user" }));

    await waitFor(() => {
      expect(readState().user).toEqual(updatedUser);
    });
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBe(
      JSON.stringify(updatedUser)
    );
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBe(session.token);
  });

  it("restores a persisted session on mount after server validation", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token);
    window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));

    renderWithProviders(<Probe />);

    await waitFor(() => {
      expect(readState()).toEqual({
        isAuthenticated: true,
        isInitializing: false,
        user,
        token: session.token,
      });
    });
    expect(getCurrentUserMock).toHaveBeenCalled();
  });

  it("clears an invalid session when server validation fails", async () => {
    getCurrentUserMock.mockRejectedValue(new Error("Invalid or expired authentication token"));
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token);
    window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));

    renderWithProviders(<Probe />);

    await waitFor(() => {
      expect(readState().isAuthenticated).toBe(false);
    });
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
  });

  it("drops an incomplete session instead of restoring it", () => {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token);

    renderWithProviders(<Probe />);

    expect(readState().isAuthenticated).toBe(false);
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
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

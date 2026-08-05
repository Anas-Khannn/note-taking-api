import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const logoutUserMock = vi.hoisted(() => vi.fn());
const getCurrentUserMock = vi.hoisted(() => vi.fn());

const routerReplace = vi.hoisted(() => vi.fn());
const routerPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    replace: routerReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("@/services/auth.service", () => ({
  logoutUser: logoutUserMock,
  getCurrentUser: getCurrentUserMock,
}));

import { AuthProvider } from "@/contexts/AuthContext";
import { authKeys } from "@/hooks/auth-keys";
import { useLogout } from "@/hooks/useAuthMutations";
import { noteKeys } from "@/hooks/note-keys";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_STORAGE_KEYS } from "@/lib/auth-storage";
import type { AuthSession, AuthUser } from "@/types/auth";

const user: AuthUser = {
  id: "u_123",
  name: "Ada Lovelace",
  email: "ada@example.com",
};

const session: AuthSession = { token: "token-abc", user };

function readState() {
  return JSON.parse(
    screen.getByTestId("auth-state").textContent ?? "null"
  ) as { isAuthenticated: boolean; user: AuthUser | null };
}

function LogoutProbe() {
  const { isAuthenticated, user: currentUser } = useAuth();
  const logoutMutation = useLogout();

  return (
    <div>
      <output data-testid="auth-state">
        {JSON.stringify({ isAuthenticated, user: currentUser })}
      </output>
      {logoutMutation.isError ? (
        <output data-testid="logout-error">
          {logoutMutation.error?.message ?? "unknown"}
        </output>
      ) : null}
      <button
        type="button"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? "Logging out…" : "Log out"}
      </button>
    </div>
  );
}

function seedSession() {
  window.localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token);
  window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
}

function renderProbe() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(noteKeys.list(), [
    { id: "n_1", title: "Private", content: "secret", status: "ACTIVE" },
  ]);
  queryClient.setQueryData(authKeys.user(), user);

  const view = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LogoutProbe />
      </AuthProvider>
    </QueryClientProvider>
  );

  return { queryClient, ...view };
}

beforeEach(() => {
  logoutUserMock.mockReset();
  logoutUserMock.mockResolvedValue(undefined);
  getCurrentUserMock.mockReset();
  getCurrentUserMock.mockResolvedValue(user);
  routerReplace.mockClear();
  routerPush.mockClear();
});

describe("useLogout", () => {
  it("clears context, storage, and protected caches, then redirects to /login", async () => {
    const userEventSetup = userEvent.setup();
    seedSession();
    const { queryClient } = renderProbe();

    await waitFor(() => {
      expect(readState().isAuthenticated).toBe(true);
    });

    await userEventSetup.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(readState().isAuthenticated).toBe(false);
      expect(readState().user).toBeNull();
    });
    expect(logoutUserMock).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
    expect(queryClient.getQueryData(noteKeys.list())).toBeUndefined();
    expect(queryClient.getQueryData(authKeys.user())).toBeUndefined();
    expect(routerReplace).toHaveBeenCalledWith("/login");
  });

  it("clears the local session even when the remote logout fails", async () => {
    const userEventSetup = userEvent.setup();
    logoutUserMock.mockRejectedValueOnce(new Error("Server unreachable"));
    seedSession();
    renderProbe();

    await waitFor(() => {
      expect(readState().isAuthenticated).toBe(true);
    });

    await userEventSetup.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(readState().isAuthenticated).toBe(false);
    });
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
    expect(routerReplace).toHaveBeenCalledWith("/login");

    const message = screen.getByTestId("logout-error").textContent ?? "";
    expect(message).not.toContain(session.token);
  });

  it("stays logged out after unmount and remount (refresh does not restore)", async () => {
    const userEventSetup = userEvent.setup();
    seedSession();
    const { unmount } = renderProbe();

    await waitFor(() => {
      expect(readState().isAuthenticated).toBe(true);
    });

    await userEventSetup.click(screen.getByRole("button", { name: "Log out" }));
    await waitFor(() => {
      expect(readState().isAuthenticated).toBe(false);
    });
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();

    unmount();
    renderProbe();

    expect(readState().isAuthenticated).toBe(false);
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
  });
});

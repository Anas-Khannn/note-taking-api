import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
  routerReplace.mockClear();
  routerPush.mockClear();
});

describe("useLogout with an unavailable backend logout route", () => {
  it("clears context, storage, and protected caches, then redirects to /login", async () => {
    const userEventSetup = userEvent.setup();
    seedSession();
    const { queryClient } = renderProbe();

    expect(readState().isAuthenticated).toBe(true);

    await userEventSetup.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(readState().isAuthenticated).toBe(false);
      expect(readState().user).toBeNull();
    });
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
    expect(queryClient.getQueryData(noteKeys.list())).toBeUndefined();
    expect(queryClient.getQueryData(authKeys.user())).toBeUndefined();
    expect(routerReplace).toHaveBeenCalledWith("/login");
  });

  it("reports that server-side logout is unavailable without leaking the token", async () => {
    const userEventSetup = userEvent.setup();
    seedSession();
    renderProbe();

    await userEventSetup.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(screen.getByTestId("logout-error")).toBeInTheDocument();
    });
    const message = screen.getByTestId("logout-error").textContent ?? "";
    expect(message).not.toContain(session.token);
    expect(message).not.toContain("password");
    expect(message.toLowerCase()).toContain("logout");
    // Local session is still cleared even though the remote call failed.
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
  });

  it("stays logged out after unmount and remount (refresh does not restore)", async () => {
    const userEventSetup = userEvent.setup();
    seedSession();
    const { unmount } = renderProbe();

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

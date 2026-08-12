import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const logoutUserMock = vi.hoisted(() => vi.fn());
const getCurrentUserMock = vi.hoisted(() => vi.fn());
const routerReplace = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
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
import { useLogout } from "@/hooks/useAuthMutations";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_STORAGE_KEYS } from "@/lib/auth-storage";
import type { AuthSession, AuthUser } from "@/types/auth.types";

const user: AuthUser = {
  user_id: "u_123",
  name: "Ada Lovelace",
  email: "ada@example.com",
};

const session: AuthSession = { token: "token-abc", user };

function LogoutProbe() {
  const { isAuthenticated } = useAuth();
  const logoutMutation = useLogout();

  return (
    <div>
      <output data-testid="auth-state">{String(isAuthenticated)}</output>
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

function renderProbe() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <LogoutProbe />
      </AuthProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  logoutUserMock.mockReset();
  getCurrentUserMock.mockReset();
  getCurrentUserMock.mockResolvedValue(user);
  routerReplace.mockClear();
  window.localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token);
  window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
});

describe("useLogout with a backend logout route available", () => {
  it("stays pending and blocks repeated clicks while the remote logout is in flight", async () => {
    const userEventSetup = userEvent.setup();
    let resolveLogout!: () => void;
    logoutUserMock.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveLogout = resolve;
        })
    );

    renderProbe();
    await userEventSetup.click(screen.getByRole("button", { name: "Log out" }));

    expect(await screen.findByRole("button", { name: "Logging out…" })).toBeDisabled();
    expect(logoutUserMock).toHaveBeenCalledTimes(1);

    // A duplicate click while pending must not fire another remote call.
    await userEventSetup.click(screen.getByRole("button", { name: "Logging out…" }));
    expect(logoutUserMock).toHaveBeenCalledTimes(1);

    resolveLogout();
    await waitFor(() => {
      expect(routerReplace).toHaveBeenCalledWith("/login");
    });
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
  });

  it("clears the local session even when the remote logout fails", async () => {
    const userEventSetup = userEvent.setup();
    logoutUserMock.mockRejectedValueOnce(new Error("Server unreachable"));

    renderProbe();
    await userEventSetup.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(screen.getByTestId("auth-state").textContent).toBe("false");
    });
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
    expect(routerReplace).toHaveBeenCalledWith("/login");

    const message = screen.getByTestId("logout-error").textContent ?? "";
    expect(message).not.toContain(session.token);
  });
});

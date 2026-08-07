import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { login, logout, push, replace, registerUser, loginUser } = vi.hoisted(
  () => ({
    login: vi.fn(),
    logout: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    registerUser: vi.fn(),
    loginUser: vi.fn(),
  })
);

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ login, logout }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

vi.mock("@/services/auth.service", () => ({
  loginUser,
  logoutUser: vi.fn(),
  registerUser,
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
}));

import { useLogin, useSignup } from "@/hooks/useAuthMutations";
import { AUTH_STORAGE_KEYS } from "@/lib/auth-storage";
import type { AuthSession, AuthUser } from "@/types/auth";

const user: AuthUser = {
  id: "u_123",
  name: "Ada Lovelace",
  email: "ada@example.com",
};

const session: AuthSession = { token: "token-abc", user };

const registerInput = {
  name: user.name,
  email: user.email,
  password: "password123",
};

const loginInput = { email: user.email, password: "password123" };

// Emulates AuthContext.login: it receives the validated session and persists
// it to localStorage via saveAuthSession.
function persistLikeAuthContext(value: AuthSession) {
  window.localStorage.setItem(AUTH_STORAGE_KEYS.token, value.token);
  window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(value.user));
}

function AuthProbe() {
  const signup = useSignup();
  const loginMutation = useLogin();

  return (
    <div>
      <button type="button" onClick={() => signup.mutate(registerInput)}>
        Sign up
      </button>
      <button type="button" onClick={() => loginMutation.mutate(loginInput)}>
        Log in
      </button>
    </div>
  );
}

function renderProbe() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProbe />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  login.mockImplementation(persistLikeAuthContext);
  registerUser.mockResolvedValue(session);
  loginUser.mockResolvedValue(session);
});

describe("useSignup", () => {
  it("creates the account without authenticating and redirects to login", async () => {
    const userEventSetup = userEvent.setup();
    renderProbe();

    await userEventSetup.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/login?registered=1")
    );

    expect(login).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
    expect(push).not.toHaveBeenCalledWith("/dashboard");
    expect(replace).not.toHaveBeenCalledWith("/dashboard");
  });
});

describe("useLogin", () => {
  it("authenticates, persists the session, and redirects to the dashboard", async () => {
    const userEventSetup = userEvent.setup();
    renderProbe();

    await userEventSetup.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(login).toHaveBeenCalledWith(session));
    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBe(
      session.token
    );
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBe(
      JSON.stringify(user)
    );
  });
});

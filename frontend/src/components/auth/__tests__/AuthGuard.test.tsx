import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({
  isAuthenticated: false,
  isInitializing: false,
}));

const routerReplace = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: routerReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

// Route protection stays off by default; this file exercises that the guard
// is a harmless passthrough while the backend has no real auth flow.
import { AuthGuard } from "@/components/auth/AuthGuard";

beforeEach(() => {
  authState.isAuthenticated = false;
  authState.isInitializing = false;
  routerReplace.mockClear();
});

describe("AuthGuard while route protection is disabled", () => {
  it("renders children for unauthenticated users without redirecting", () => {
    render(
      <AuthGuard requireAuth>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it("does not flash a loading state while initializing", () => {
    authState.isInitializing = true;

    render(
      <AuthGuard requireAuth>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(screen.queryByLabelText("Loading")).not.toBeInTheDocument();
  });
});

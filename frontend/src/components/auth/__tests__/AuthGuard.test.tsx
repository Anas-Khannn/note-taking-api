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

import { AuthGuard } from "@/components/auth/AuthGuard";

beforeEach(() => {
  authState.isAuthenticated = false;
  authState.isInitializing = false;
  routerReplace.mockClear();
});

describe("AuthGuard with route protection enabled", () => {
  it("redirects unauthenticated users to /login", () => {
    render(
      <AuthGuard requireAuth>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(routerReplace).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders children for authenticated users without redirecting", () => {
    authState.isAuthenticated = true;

    render(
      <AuthGuard requireAuth>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it("shows a loading state while initializing instead of flashing content", () => {
    authState.isInitializing = true;

    render(
      <AuthGuard requireAuth>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it("sends authenticated users away from public-only pages to /dashboard", () => {
    authState.isAuthenticated = true;

    render(
      <AuthGuard onlyPublic>
        <p>Public content</p>
      </AuthGuard>
    );

    expect(routerReplace).toHaveBeenCalledWith("/dashboard");
    expect(screen.queryByText("Public content")).not.toBeInTheDocument();
  });
});

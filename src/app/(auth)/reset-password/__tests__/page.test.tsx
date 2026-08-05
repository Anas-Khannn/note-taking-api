import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const resetMutation = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null as Error | null,
  data: null as { message: string } | null,
}));

const searchParamsGet = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useAuthMutations", () => ({
  useResetPassword: () => resetMutation,
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: searchParamsGet }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

import ResetPasswordPage from "@/app/(auth)/reset-password/page";

function renderPage() {
  return render(<ResetPasswordPage />);
}

beforeEach(() => {
  searchParamsGet.mockReturnValue("reset-token-123");
  resetMutation.mutate.mockClear();
  resetMutation.isPending = false;
  resetMutation.isError = false;
  resetMutation.isSuccess = false;
  resetMutation.error = null;
  resetMutation.data = null;
});

describe("ResetPasswordPage", () => {
  it("renders the form when a token is present in the URL", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { level: 1, name: "Set a new password" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset password" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to sign in" })).toBeInTheDocument();
  });

  it("shows validation errors and does not submit an empty form", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(
      await screen.findByText("Password must be at least 8 characters.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Re-enter your new password.")
    ).toBeInTheDocument();
    expect(resetMutation.mutate).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("New password"), "password123");
    await user.type(screen.getByLabelText("Confirm new password"), "different123");
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
    expect(resetMutation.mutate).not.toHaveBeenCalled();
  });

  it("submits the new password with the token from the URL", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("New password"), "newpassword123");
    await user.type(screen.getByLabelText("Confirm new password"), "newpassword123");
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    await waitFor(() => {
      expect(resetMutation.mutate).toHaveBeenCalledWith({
        token: "reset-token-123",
        password: "newpassword123",
      });
    });
  });

  it("shows an error banner when the mutation fails", () => {
    resetMutation.isError = true;
    resetMutation.error = new Error("This password reset link is invalid or has expired");
    renderPage();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Could not reset your password");
    expect(alert).toHaveTextContent("invalid or has expired");
  });

  it("shows a success banner when the mutation succeeds", () => {
    resetMutation.isSuccess = true;
    resetMutation.data = { message: "Your password has been reset successfully" };
    renderPage();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Password reset");
    expect(alert).toHaveTextContent("reset successfully");
  });

  it("shows an invalid-link state when no token is present", () => {
    searchParamsGet.mockReturnValue(null);
    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid reset link");
    expect(screen.getByRole("link", { name: "Request a new reset link" })).toBeInTheDocument();
  });
});

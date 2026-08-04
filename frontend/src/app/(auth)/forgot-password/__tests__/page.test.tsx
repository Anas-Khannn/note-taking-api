import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const forgotMutation = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null as Error | null,
  data: null as { message: string } | null,
}));

vi.mock("@/hooks/useAuthMutations", () => ({
  useForgotPassword: () => forgotMutation,
}));

import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";

function renderPage() {
  return render(<ForgotPasswordPage />);
}

beforeEach(() => {
  forgotMutation.mutate.mockClear();
  forgotMutation.isPending = false;
  forgotMutation.isError = false;
  forgotMutation.isSuccess = false;
  forgotMutation.error = null;
  forgotMutation.data = null;
});

describe("ForgotPasswordPage", () => {
  it("renders the heading, email field, and actions", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { level: 1, name: "Reset your password" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send reset instructions" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to sign in" })).toBeInTheDocument();
  });

  it("shows a validation error and does not submit an empty email", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Send reset instructions" }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(forgotMutation.mutate).not.toHaveBeenCalled();
  });

  it("submits the email address", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset instructions" }));

    await waitFor(() => {
      expect(forgotMutation.mutate).toHaveBeenCalledWith({
        email: "ada@example.com",
      });
    });
  });

  it("shows a success banner with the reset message", () => {
    forgotMutation.isSuccess = true;
    forgotMutation.data = { message: "Check your inbox for password reset instructions." };
    renderPage();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Check your inbox");
    expect(alert).toHaveTextContent(
      "Check your inbox for password reset instructions."
    );
  });

  it("shows an error banner when the mutation fails", () => {
    forgotMutation.isError = true;
    forgotMutation.error = new Error("Something went wrong");
    renderPage();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Could not send instructions");
    expect(alert).toHaveTextContent("Something went wrong");
  });
});

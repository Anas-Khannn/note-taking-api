import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loginMutation = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null as Error | null,
  data: null,
}));

vi.mock("@/hooks/useAuthMutations", () => ({
  useLogin: () => loginMutation,
}));

import LoginPage from "@/app/(auth)/login/page";

function renderPage() {
  return render(<LoginPage />);
}

beforeEach(() => {
  loginMutation.mutate.mockClear();
  loginMutation.isPending = false;
  loginMutation.isError = false;
  loginMutation.isSuccess = false;
  loginMutation.error = null;
  loginMutation.data = null;
});

describe("LoginPage", () => {
  it("renders the heading, form fields, and links", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { level: 1, name: "Welcome back" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Forgot password?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create one" })).toBeInTheDocument();
  });

  it("shows validation errors and does not submit an empty form", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(loginMutation.mutate).not.toHaveBeenCalled();
  });

  it("rejects an invalid email format", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(loginMutation.mutate).not.toHaveBeenCalled();
  });

  it("submits valid credentials", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(loginMutation.mutate).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "password123",
      });
    });
  });

  it("shows an error banner when the mutation fails", () => {
    loginMutation.isError = true;
    loginMutation.error = new Error("Invalid credentials");
    renderPage();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Could not sign in");
    expect(alert).toHaveTextContent("Invalid credentials");
  });

  it("disables the submit button and marks the form busy while pending", () => {
    loginMutation.isPending = true;
    const { container } = renderPage();

    const button = screen.getByRole("button", { name: "Sign in" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector("form")).toHaveAttribute("aria-busy", "true");
  });
});

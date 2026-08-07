import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const signupMutation = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null as Error | null,
  data: null as unknown,
}));

vi.mock("@/hooks/useAuthMutations", () => ({
  useSignup: () => signupMutation,
}));

import SignupPage from "@/app/(auth)/signup/page";

const validSignup = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "password123",
};

function renderPage() {
  return render(<SignupPage />);
}

beforeEach(() => {
  signupMutation.mutate.mockClear();
  signupMutation.isPending = false;
  signupMutation.isError = false;
  signupMutation.isSuccess = false;
  signupMutation.error = null;
  signupMutation.data = null;
});

describe("SignupPage", () => {
  it("renders the heading and all form fields", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { level: 1, name: "Create your MemoNest" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows validation errors and does not submit an empty form", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
    expect(screen.getByText("Re-enter your password to confirm it.")).toBeInTheDocument();
    expect(signupMutation.mutate).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Full name"), validSignup.name);
    await user.type(screen.getByLabelText("Email"), validSignup.email);
    await user.type(screen.getByLabelText("Password"), validSignup.password);
    await user.type(screen.getByLabelText("Confirm password"), "different123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
    expect(signupMutation.mutate).not.toHaveBeenCalled();
  });

  it("submits name, email, and password (without the confirmation field)", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Full name"), validSignup.name);
    await user.type(screen.getByLabelText("Email"), validSignup.email);
    await user.type(screen.getByLabelText("Password"), validSignup.password);
    await user.type(screen.getByLabelText("Confirm password"), validSignup.password);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(signupMutation.mutate).toHaveBeenCalledWith(validSignup);
    });
  });

  it("shows the password strength indicator while typing", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Password"), "Password1!");

    expect(
      await screen.findByRole("img", { name: "Password strength: Strong" })
    ).toBeInTheDocument();
  });

  it("shows an error banner when the mutation fails", () => {
    signupMutation.isError = true;
    signupMutation.error = new Error("Email already in use");
    renderPage();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Could not create your account");
    expect(alert).toHaveTextContent("Email already in use");
  });
});

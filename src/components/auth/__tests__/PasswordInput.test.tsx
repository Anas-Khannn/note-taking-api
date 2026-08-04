import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PasswordInput } from "@/components/auth/PasswordInput";

describe("PasswordInput", () => {
  it("renders the password field as hidden by default", () => {
    render(<PasswordInput id="pw" label="Password" />);

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("toggles between password and text", async () => {
    const user = userEvent.setup();
    render(<PasswordInput id="pw" label="Password" />);

    const input = screen.getByLabelText("Password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("renders the error message and wires aria-describedby", () => {
    render(<PasswordInput id="pw" label="Password" error="Too short" />);

    const input = screen.getByLabelText("Password");
    expect(screen.getByText("Too short")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-describedby", "pw-error");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("omits the label when not provided", () => {
    render(<PasswordInput id="pw" label="" />);

    expect(screen.queryByText("Password")).not.toBeInTheDocument();
  });
});

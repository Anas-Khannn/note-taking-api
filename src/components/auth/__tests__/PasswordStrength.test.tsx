import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PasswordStrength } from "@/components/auth/PasswordStrength";

describe("PasswordStrength", () => {
  it("renders nothing for an empty password", () => {
    const { container } = render(<PasswordStrength password="" />);

    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    ["a", "Weak"],
    ["password", "Fair"],
    ["Password1!", "Strong"],
  ])("labels %s as %s", (password, label) => {
    render(<PasswordStrength password={password} />);

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: `Password strength: ${label}` })
    ).toBeInTheDocument();
  });
});

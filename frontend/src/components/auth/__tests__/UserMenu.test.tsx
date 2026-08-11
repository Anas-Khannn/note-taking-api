import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({
  user: {
    user_id: "u_123",
    name: "Ada Lovelace",
    email: "ada@example.com",
    profile_image_url: null as string | null,
  },
  isAuthenticated: true,
}));

const logoutMutation = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null as Error | null,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/hooks/useAuthMutations", () => ({
  useLogout: () => logoutMutation,
}));

import { UserMenu } from "@/components/auth/UserMenu";

function renderMenu() {
  return render(
    <div>
      <UserMenu />
      <button type="button">Outside</button>
    </div>
  );
}

beforeEach(() => {
  authState.user = {
    user_id: "u_123",
    name: "Ada Lovelace",
    email: "ada@example.com",
    profile_image_url: null,
  };
  authState.isAuthenticated = true;
  logoutMutation.mutate.mockClear();
  logoutMutation.isPending = false;
  logoutMutation.isError = false;
  logoutMutation.error = null;
});

describe("UserMenu", () => {
  it("renders the real user initials, never a hardcoded fake avatar", () => {
    renderMenu();

    const trigger = screen.getByRole("button", {
      name: "Account menu for Ada Lovelace",
    });
    expect(trigger).toHaveTextContent("AL");
    expect(screen.queryByText("AK")).not.toBeInTheDocument();
  });

  it("renders the profile photo when the user has one", () => {
    authState.user = {
      user_id: "u_123",
      name: "Ada Lovelace",
      email: "ada@example.com",
      profile_image_url: "/uploads/profile/avatar.png",
    };
    renderMenu();

    const img = screen.getByAltText("Ada Lovelace profile picture");
    expect(img).toHaveAttribute(
      "src",
      "http://localhost:5000/uploads/profile/avatar.png"
    );
    expect(screen.queryByText("AL")).not.toBeInTheDocument();
  });

  it("closes the menu when the Profile item is activated", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(
      screen.getByRole("button", { name: "Account menu for Ada Lovelace" })
    );
    expect(screen.getByRole("menu", { name: "Account menu" })).toBeInTheDocument();

    await user.click(screen.getByRole("menuitem", { name: "Profile" }));

    expect(screen.queryByRole("menu", { name: "Account menu" })).not.toBeInTheDocument();
  });

  it("opens the menu on mouse click and shows the real identity", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(
      screen.getByRole("button", { name: "Account menu for Ada Lovelace" })
    );

    const menu = screen.getByRole("menu", { name: "Account menu" });
    expect(menu).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Log out" })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Profile" })
    ).toHaveAttribute("href", "/profile");
    expect(
      screen.getByRole("button", { name: "Account menu for Ada Lovelace" })
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: "Account menu for Ada Lovelace" })
    ).toHaveAttribute("aria-haspopup", "menu");
  });

  it("opens the menu with the keyboard", async () => {
    const user = userEvent.setup();
    renderMenu();

    const trigger = screen.getByRole("button", {
      name: "Account menu for Ada Lovelace",
    });
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("menu", { name: "Account menu" })).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderMenu();

    const trigger = screen.getByRole("button", {
      name: "Account menu for Ada Lovelace",
    });
    await user.click(trigger);
    expect(screen.getByRole("menu", { name: "Account menu" })).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu", { name: "Account menu" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when clicking outside the menu", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(
      screen.getByRole("button", { name: "Account menu for Ada Lovelace" })
    );
    expect(screen.getByRole("menu", { name: "Account menu" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Outside" }));

    expect(screen.queryByRole("menu", { name: "Account menu" })).not.toBeInTheDocument();
  });

  it("enters a pending state on logout and prevents repeated clicks", async () => {
    logoutMutation.isPending = true;
    const user = userEvent.setup();
    renderMenu();

    await user.click(
      screen.getByRole("button", { name: "Account menu for Ada Lovelace" })
    );

    const item = screen.getByRole("menuitem", { name: "Logging out…" });
    expect(item).toBeDisabled();
    expect(screen.getByRole("menuitem", { name: "Logging out…" })).toBeInTheDocument();
  });

  it("closes the menu and triggers the logout mutation", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(
      screen.getByRole("button", { name: "Account menu for Ada Lovelace" })
    );
    await user.click(screen.getByRole("menuitem", { name: "Log out" }));

    expect(logoutMutation.mutate).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu", { name: "Account menu" })).not.toBeInTheDocument();
  });

  it("renders nothing when the user is not authenticated", () => {
    authState.isAuthenticated = false;

    const { container } = render(<UserMenu />);

    expect(container).toBeEmptyDOMElement();
  });
});

"use client";

import { useState } from "react";
import { Menu, NotebookPen, Plus, User, X } from "lucide-react";

import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import type { AuthUser } from "@/types/auth";
import type { NoteFilter } from "@/types/note";

interface NavbarProps {
  view: NoteFilter;
  onViewChange: (view: NoteFilter) => void;
  onAddNote: () => void;
}

function getInitials(user: AuthUser): string {
  const name = user.name.trim();
  if (!name) {
    return user.email.slice(0, 1).toUpperCase() || "?";
  }
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Navbar({ view, onViewChange, onAddNote }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isInitializing, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-navbar-bg shadow-memo-subtle">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-6 xl:px-12"
      >
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-10 items-center justify-center rounded-memo-md bg-brand/10 text-brand"
            aria-hidden="true"
          >
            <NotebookPen size={22} strokeWidth={2} />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">
            MemoNest
          </span>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink
            active={view === "all"}
            onClick={() => onViewChange("all")}
          >
            All Notes
          </NavLink>
          <NavLink
            active={view === "archived"}
            onClick={() => onViewChange("archived")}
          >
            Archived
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="hidden md:inline-flex"
            leftIcon={<Plus size={18} strokeWidth={2} />}
            onClick={onAddNote}
          >
            Add Note
          </Button>

          {isInitializing ? (
            <span
              aria-label="Loading profile"
              className="flex size-11 items-center justify-center rounded-full bg-skeleton animate-pulse"
            />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Signed in as ${user.name}`}
                title={user.name}
                className="flex size-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-on transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
              >
                {getInitials(user)}
              </button>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign out
              </Button>
            </div>
          ) : (
            <span
              aria-label="Guest"
              className="flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand"
            >
              <User size={22} strokeWidth={2} aria-hidden="true" />
            </span>
          )}

          <IconButton
            label={mobileOpen ? "Close menu" : "Open menu"}
            icon={mobileOpen ? X : Menu}
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="md:hidden"
          />
        </div>
      </nav>

      <MobileNavigation
        id="mobile-navigation"
        open={mobileOpen}
        view={view}
        onViewChange={onViewChange}
        onAddNote={onAddNote}
        onClose={() => setMobileOpen(false)}
      />
    </header>
  );
}

interface NavLinkProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function NavLink({ active, onClick, children }: NavLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "h-10 rounded-full px-4 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        active
          ? "bg-brand/10 text-brand"
          : "text-ink-secondary hover:bg-border-subtle/70 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

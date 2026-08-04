"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LoaderCircle, LogOut } from "lucide-react";

import { useLogout } from "@/hooks/useAuthMutations";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import type { AuthUser } from "@/types/auth";

// Accessible profile menu. Desktop and mobile share the same dropdown so the
// 44x44px trigger target and the ARIA menu semantics stay consistent.

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

export function UserMenu() {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const logoutItemRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Close on Escape and on any pointer interaction outside the menu.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  // Move focus into the menu when it opens (APG menu pattern).
  useEffect(() => {
    if (open) {
      logoutItemRef.current?.focus();
    }
  }, [open]);

  const handleMenuKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (document.activeElement === triggerRef.current) {
        logoutItemRef.current?.focus();
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (document.activeElement !== triggerRef.current) {
        triggerRef.current?.focus();
      }
    }
  };

  const handleLogout = () => {
    setOpen(false);
    logoutMutation.mutate();
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const pending = logoutMutation.isPending;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Account menu for ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={cn(
          "flex h-11 min-w-11 items-center justify-center gap-1 rounded-full border border-border-subtle bg-navbar-bg px-1.5",
          "transition-colors hover:bg-border-subtle/70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
          open && "bg-border-subtle/70"
        )}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-on">
          {getInitials(user)}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden="true"
          className={cn("text-ink-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account menu"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-memo-md border border-border-subtle bg-navbar-bg shadow-memo-standard"
        >
          <div role="presentation" className="px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>
          <div role="separator" className="h-px bg-border-subtle" />
          <button
            ref={logoutItemRef}
            type="button"
            role="menuitem"
            disabled={pending}
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-ink-secondary",
              "transition-colors hover:bg-border-subtle/70 hover:text-error",
              "focus-visible:bg-border-subtle/70 focus-visible:text-error focus-visible:outline-none",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {pending ? (
              <LoaderCircle size={18} strokeWidth={2} className="animate-spin" aria-hidden="true" />
            ) : (
              <LogOut size={18} strokeWidth={2} aria-hidden="true" />
            )}
            {pending ? "Logging out…" : "Log out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LoaderCircle, LogOut, UserRound } from "lucide-react";

import { useLogout } from "@/hooks/useAuthMutations";
import { useAuth } from "@/hooks/useAuth";
import { resolveApiUrl } from "@/lib/api";
import { cn } from "@/lib/cn";
import { getUserInitials } from "@/lib/initials";
import type { AuthUser } from "@/types/auth";

// Accessible profile menu. Desktop and mobile share the same dropdown so the
// 44x44px trigger target and the ARIA menu semantics stay consistent.

function Avatar({ user }: { user: AuthUser }) {
  const imageUrl = user.profileImageUrl
    ? resolveApiUrl(user.profileImageUrl)
    : null;

  if (imageUrl) {
    return (
      // Avatar images are served from the API origin and never optimized.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={`${user.name} profile picture`}
        className="size-9 rounded-full border border-border-subtle object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-on"
    >
      {getUserInitials(user)}
    </span>
  );
}

export function UserMenu() {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const profileItemRef = useRef<HTMLAnchorElement>(null);
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
      profileItemRef.current?.focus();
    }
  }, [open]);

  const handleMenuKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (document.activeElement === triggerRef.current) {
        profileItemRef.current?.focus();
      } else if (document.activeElement === profileItemRef.current) {
        logoutItemRef.current?.focus();
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (document.activeElement === logoutItemRef.current) {
        profileItemRef.current?.focus();
      } else {
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
        <Avatar user={user} />
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
          <Link
            ref={profileItemRef}
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={cn(
              "flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-ink-secondary",
              "transition-colors hover:bg-border-subtle/70 hover:text-ink",
              "focus-visible:bg-border-subtle/70 focus-visible:outline-none"
            )}
          >
            <UserRound size={18} strokeWidth={2} aria-hidden="true" />
            Profile
          </Link>
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

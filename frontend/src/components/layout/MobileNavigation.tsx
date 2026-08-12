"use client";

import { useEffect } from "react";
import { LoaderCircle, LogIn, LogOut, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { useLogout } from "@/hooks/useAuthMutations";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import type { NoteFilter } from "@/types/note.types";

interface MobileNavigationProps {
  id: string;
  open: boolean;
  view: NoteFilter;
  onViewChange: (view: NoteFilter) => void;
  onAddNote: () => void;
  onClose: () => void;
}

export function MobileNavigation({
  id,
  open,
  view,
  onViewChange,
  onAddNote,
  onClose,
}: MobileNavigationProps) {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleLogout = () => {
    // Close the menu first so the pending state never blocks the drawer.
    onClose();
    logoutMutation.mutate();
  };

  return (
    <div
      id={id}
      hidden={!open}
      className="md:hidden"
    >
      <div className="flex flex-col gap-1 border-t border-border-subtle bg-navbar-bg px-6 py-4">
        <MobileLink
          active={view === "all"}
          onClick={() => {
            onViewChange("all");
            onClose();
          }}
        >
          All Notes
        </MobileLink>
        <MobileLink
          active={view === "archived"}
          onClick={() => {
            onViewChange("archived");
            onClose();
          }}
        >
          Archived
        </MobileLink>
        <Button
          className={cn("mt-2 w-full")}
          leftIcon={<Plus size={18} strokeWidth={2} />}
          onClick={() => {
            onAddNote();
            onClose();
          }}
        >
          Add Note
        </Button>

        {!isInitializing && isAuthenticated && user ? (
          <>
            <div role="separator" className="my-1 h-px bg-border-subtle" />
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className={cn(
                "flex h-11 w-full items-center gap-2.5 rounded-memo-md px-4 text-left text-sm font-medium text-ink-secondary",
                "transition-colors hover:bg-border-subtle/70 hover:text-error",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                "disabled:cursor-not-allowed disabled:opacity-60"
              )}
            >
              {logoutMutation.isPending ? (
                <LoaderCircle size={18} strokeWidth={2} className="animate-spin" aria-hidden="true" />
              ) : (
                <LogOut size={18} strokeWidth={2} aria-hidden="true" />
              )}
              {logoutMutation.isPending ? "Logging out…" : "Log out"}
            </button>
          </>
        ) : !isInitializing ? (
          <Link
            href="/login"
            onClick={onClose}
            className={cn(
              "mt-1 flex h-11 w-full items-center gap-2.5 rounded-memo-md px-4 text-left text-sm font-semibold text-brand",
              "transition-colors hover:bg-brand/10 hover:text-brand-hover",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            )}
          >
            <LogIn size={18} strokeWidth={2} aria-hidden="true" />
            Sign In
          </Link>
        ) : null}
      </div>
    </div>
  );
}

interface MobileLinkProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function MobileLink({ active, onClick, children }: MobileLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 w-full items-center rounded-memo-md px-4 text-left text-sm font-medium transition-colors",
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

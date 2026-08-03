"use client";

import { useEffect } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { NoteFilter } from "@/types/note";

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

import { cn } from "@/lib/cn";
import type { NoteStatus } from "@/types/note";

interface NoteStatusBadgeProps {
  status: NoteStatus;
}

export function NoteStatusBadge({ status }: NoteStatusBadgeProps) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
        isActive
          ? "bg-status-active-bg text-status-active-text"
          : "bg-status-archived-bg text-status-archived-text"
      )}
    >
      {isActive ? "Active" : "Archived"}
    </span>
  );
}

import type { NoteStatus } from "@/src/types/note";

interface NoteStatusBadgeProps {
  status: NoteStatus;
}

const statusConfig: Record<NoteStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  DELETED: {
    label: "Deleted",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export function NoteStatusBadge({ status }: NoteStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

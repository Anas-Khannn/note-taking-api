"use client";

import { Archive, Pencil, Trash2 } from "lucide-react";

import { IconButton } from "@/components/ui/IconButton";
import { formatNoteDate } from "@/lib/dates";
import type { Note } from "@/types/note";

import { NoteStatusBadge } from "@/components/notes/NoteStatusBadge";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onToggleArchive: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NoteCard({
  note,
  onEdit,
  onToggleArchive,
  onDelete,
}: NoteCardProps) {
  const isActive = note.status === "ACTIVE";

  return (
    <article className="flex h-full flex-col rounded-memo-md bg-card-surface p-6 shadow-memo-subtle transition-all hover:-translate-y-0.5 hover:shadow-memo-standard">
      <div className="flex items-start justify-between gap-3">
        <NoteStatusBadge status={note.status} />
        <time
          dateTime={note.updated_at}
          className="shrink-0 pt-1 text-sm text-ink-muted"
        >
          {formatNoteDate(note.updated_at)}
        </time>
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug text-ink">
        {note.title}
      </h3>

      <p className="mt-2 line-clamp-3 text-base text-ink-secondary">
        {note.content}
      </p>

      <div className="mt-5 flex items-center gap-1 border-t border-border-subtle pt-3">
        <IconButton
          label={`Edit note "${note.title}"`}
          icon={Pencil}
          onClick={() => onEdit(note)}
        />
        <IconButton
          label={
            isActive
              ? `Archive note "${note.title}"`
              : `Unarchive note "${note.title}"`
          }
          icon={Archive}
          onClick={() => onToggleArchive(note)}
        />
        <IconButton
          label={`Delete note "${note.title}"`}
          icon={Trash2}
          tone="danger"
          onClick={() => onDelete(note)}
        />
      </div>
    </article>
  );
}

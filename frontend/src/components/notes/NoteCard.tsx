"use client";

import { Pencil, Archive, Trash2 } from "lucide-react";
import type { Note } from "@/src/types/note";
import { NoteStatusBadge } from "@/src/components/notes/NoteStatusBadge";
import { IconButton } from "@/src/components/ui/IconButton";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onArchive: (note: Note) => void;
  onDelete: (note: Note) => void;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function NoteCard({
  note,
  onEdit,
  onArchive,
  onDelete,
}: NoteCardProps) {
  return (
    <article className="bg-white rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <NoteStatusBadge status={note.status} />
        <time
          dateTime={note.created_at}
          className="text-xs text-gray-400 shrink-0 ml-2"
        >
          {formatDate(note.created_at)}
        </time>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-2">
        {note.title || "Untitled"}
      </h3>

      <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
        {note.content || "No content"}
      </p>

      <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
        <IconButton
          aria-label={`Edit ${note.title || "note"}`}
          onClick={() => onEdit(note)}
        >
          <Pencil size={16} />
        </IconButton>
        <IconButton
          aria-label={
            note.status === "ARCHIVED" ? "Unarchive note" : "Archive note"
          }
          onClick={() => onArchive(note)}
        >
          <Archive size={16} />
        </IconButton>
        <IconButton
          aria-label={`Delete ${note.title || "note"}`}
          onClick={() => onDelete(note)}
          variant="danger"
        >
          <Trash2 size={16} />
        </IconButton>
      </div>
    </article>
  );
}

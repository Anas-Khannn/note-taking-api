"use client";

import type { Note } from "@/src/types/note";
import { NoteCard } from "@/src/components/notes/NoteCard";

interface NotesGridProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onArchive: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NotesGrid({
  notes,
  onEdit,
  onArchive,
  onDelete,
}: NotesGridProps) {
  if (notes.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

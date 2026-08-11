"use client";

import type { Note } from "@/types/note";

import { NoteCard } from "@/components/notes/NoteCard";

interface NotesGridProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onToggleArchive: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NotesGrid({
  notes,
  onEdit,
  onToggleArchive,
  onDelete,
}: NotesGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <li key={note.note_id} className="min-w-0">
          <NoteCard
            note={note}
            onEdit={onEdit}
            onToggleArchive={onToggleArchive}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}

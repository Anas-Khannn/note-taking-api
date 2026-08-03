"use client";

import { NotebookPen, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface NotesEmptyStateProps {
  onCreateNote: () => void;
}

export function NotesEmptyState({ onCreateNote }: NotesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-brand/10">
        <NotebookPen size={36} strokeWidth={1.6} aria-hidden="true" />
        <span className="sr-only">MemoNest</span>
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-ink">No notes yet</h2>
      <p className="mt-2 max-w-sm text-base text-ink-secondary">
        Your workspace is empty. Capture your first idea and start organizing.
      </p>
      <Button
        className="mt-6"
        leftIcon={<Plus size={18} strokeWidth={2} />}
        onClick={onCreateNote}
      >
        Create your first note
      </Button>
    </div>
  );
}

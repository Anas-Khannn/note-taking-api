"use client";

import { useMemo, useState } from "react";
import { Plus, SearchX } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { DeleteNoteDialog } from "@/components/notes/DeleteNoteDialog";
import { NoteModal } from "@/components/notes/NoteModal";
import { NotesEmptyState } from "@/components/notes/NotesEmptyState";
import { NotesErrorState } from "@/components/notes/NotesErrorState";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotesLoadingState } from "@/components/notes/NotesLoadingState";
import { NotesToolbar } from "@/components/notes/NotesToolbar";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useUpdateNote,
} from "@/hooks/useNotes";
import type { CreateNoteInput, Note, NoteFilter } from "@/types/note";

export default function HomePage() {
  const [view, setView] = useState<NoteFilter>("all");
  const [search, setSearch] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data, isPending, isError, error, refetch } = useNotes();
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const notes = useMemo(
    () => (data ?? []).filter((note) => note.status !== "DELETED"),
    [data]
  );

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesView =
        view === "all" || note.status === view.toUpperCase();
      const matchesSearch =
        query.length === 0 ||
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query);
      return matchesView && matchesSearch;
    });
  }, [notes, view, search]);

  const openCreateModal = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const openDeleteDialog = (note: Note) => {
    setDeletingNote(note);
    setIsDeleteOpen(true);
  };

  const toggleArchive = (note: Note) => {
    updateMutation.mutate({
      id: note.id,
      input: { status: note.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE" },
    });
  };

  const handleCreate = async (input: CreateNoteInput) => {
    await createMutation.mutateAsync(input);
    setIsNoteModalOpen(false);
    setEditingNote(null);
  };

  const handleUpdate = async (input: CreateNoteInput) => {
    if (!editingNote) return;
    await updateMutation.mutateAsync({ id: editingNote.id, input });
    setIsNoteModalOpen(false);
    setEditingNote(null);
  };

  const handleDelete = async (note: Note) => {
    await deleteMutation.mutateAsync(note.id);
    setIsDeleteOpen(false);
    setDeletingNote(null);
  };

  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
    setEditingNote(null);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
    setDeletingNote(null);
  };

  const clearFilters = () => {
    setSearch("");
    setView("all");
  };

  const hasActiveFilters = search.trim().length > 0 || view !== "all";
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar view={view} onViewChange={setView} onAddNote={openCreateModal} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 xl:px-12">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            Workspace
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-ink">
            Your Notes
          </h1>
          <p className="mt-2 max-w-xl text-base text-ink-secondary">
            Capture, organize, and revisit your ideas whenever inspiration
            strikes.
          </p>
        </header>

        {!isPending && !isError && (
          <NotesToolbar
            search={search}
            onSearchChange={setSearch}
            filter={view}
            onFilterChange={setView}
            totalCount={filteredNotes.length}
          />
        )}

        <section className="mt-8 pb-24 md:pb-8" aria-live="polite">
          {isPending ? (
            <NotesLoadingState />
          ) : isError ? (
            <NotesErrorState error={error} onRetry={() => void refetch()} />
          ) : notes.length === 0 ? (
            <NotesEmptyState onCreateNote={openCreateModal} />
          ) : filteredNotes.length === 0 ? (
            <NoSearchResults
              hasActiveFilters={hasActiveFilters}
              onClear={clearFilters}
              onAddNote={openCreateModal}
            />
          ) : (
            <NotesGrid
              notes={filteredNotes}
              onEdit={openEditModal}
              onToggleArchive={toggleArchive}
              onDelete={openDeleteDialog}
            />
          )}
        </section>
      </main>

      <IconButton
        label="Add note"
        icon={Plus}
        iconSize={24}
        tone="brand"
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 z-30 size-14 shadow-memo-standard md:hidden"
      />

      <NoteModal
        key={`${isNoteModalOpen ? "open" : "closed"}:${editingNote?.id ?? "create"}`}
        open={isNoteModalOpen}
        mode={editingNote ? "edit" : "create"}
        note={editingNote}
        onClose={closeNoteModal}
        onSubmit={editingNote ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
      />

      <DeleteNoteDialog
        open={isDeleteOpen}
        note={deletingNote}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

interface NoSearchResultsProps {
  hasActiveFilters: boolean;
  onClear: () => void;
  onAddNote: () => void;
}

function NoSearchResults({
  hasActiveFilters,
  onClear,
  onAddNote,
}: NoSearchResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-input-bg">
        <SearchX size={36} strokeWidth={1.6} aria-hidden="true" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-ink">
        No matching notes
      </h2>
      <p className="mt-2 max-w-sm text-base text-ink-secondary">
        Nothing matches your current search or filter. Try adjusting your
        filters or create a new note.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onClear}>
            Clear filters
          </Button>
        )}
        <Button
          leftIcon={<Plus size={18} strokeWidth={2} />}
          onClick={onAddNote}
        >
          Create note
        </Button>
      </div>
    </div>
  );
}

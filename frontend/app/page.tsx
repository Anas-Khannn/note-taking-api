"use client";

import { useState, useMemo, useCallback } from "react";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/src/hooks/useNotes";
import { Navbar } from "@/src/components/layout/Navbar";
import { MobileNavigation } from "@/src/components/layout/MobileNavigation";
import { NotesToolbar } from "@/src/components/notes/NotesToolbar";
import { NotesGrid } from "@/src/components/notes/NotesGrid";
import { NoteModal } from "@/src/components/notes/NoteModal";
import { DeleteNoteDialog } from "@/src/components/notes/DeleteNoteDialog";
import { NotesLoadingState } from "@/src/components/notes/NotesLoadingState";
import { NotesEmptyState } from "@/src/components/notes/NotesEmptyState";
import { NotesErrorState } from "@/src/components/notes/NotesErrorState";
import type { Note, CreateNoteInput, UpdateNoteInput } from "@/src/types/note";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);

  const { data, isLoading, isError, error, refetch } = useNotes();
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const filteredNotes = useMemo(() => {
    const notes = data?.data ?? [];
    let result = notes;

    if (activeFilter === "ACTIVE") {
      result = result.filter((n) => n.status === "ACTIVE");
    } else if (activeFilter === "ARCHIVED") {
      result = result.filter((n) => n.status === "ARCHIVED");
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query)
      );
    }

    return result;
  }, [data, activeFilter, searchQuery]);

  const handleCreateNote = useCallback(
    (input: CreateNoteInput | UpdateNoteInput) => {
      createMutation.mutate(input as CreateNoteInput, {
        onSuccess: () => {
          setIsCreateModalOpen(false);
        },
      });
    },
    [createMutation]
  );

  const handleUpdateNote = useCallback(
    (input: CreateNoteInput | UpdateNoteInput) => {
      if (!editingNote) return;
      updateMutation.mutate(
        { id: editingNote.id, input: input as UpdateNoteInput },
        {
          onSuccess: () => {
            setEditingNote(null);
          },
        }
      );
    },
    [editingNote, updateMutation]
  );

  const handleArchiveNote = useCallback(
    (note: Note) => {
      const newStatus = note.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
      updateMutation.mutate({ id: note.id, input: { status: newStatus } });
    },
    [updateMutation]
  );

  const handleDeleteNote = useCallback(() => {
    if (!deletingNote) return;
    deleteMutation.mutate(deletingNote.id, {
      onSuccess: () => {
        setDeletingNote(null);
      },
    });
  }, [deletingNote, deleteMutation]);

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F5FF]">
      <Navbar
        onAddNote={() => setIsCreateModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-widest mb-1">
            Workspace
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Your Notes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your notes and stay organized.
          </p>
        </div>

        <div className="mb-6">
          <NotesToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            totalCount={filteredNotes.length}
          />
        </div>

        {isLoading ? (
          <NotesLoadingState />
        ) : isError ? (
          <NotesErrorState
            message={
              error instanceof Error ? error.message : undefined
            }
            onRetry={() => refetch()}
          />
        ) : filteredNotes.length === 0 && searchQuery ? (
          <NotesEmptyState isSearching searchQuery={searchQuery} />
        ) : filteredNotes.length === 0 ? (
          <NotesEmptyState />
        ) : (
          <NotesGrid
            notes={filteredNotes}
            onEdit={(note) => setEditingNote(note)}
            onArchive={handleArchiveNote}
            onDelete={(note) => setDeletingNote(note)}
          />
        )}
      </main>

      <MobileNavigation onAddNote={() => setIsCreateModalOpen(true)} />

      <NoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateNote}
        isSubmitting={isSubmitting}
      />

      <NoteModal
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        onSubmit={handleUpdateNote}
        note={editingNote}
        isSubmitting={isSubmitting}
      />

      <DeleteNoteDialog
        isOpen={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleDeleteNote}
        note={deletingNote}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

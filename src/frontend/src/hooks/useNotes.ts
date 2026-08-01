"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { noteService } from "@/src/services/note.service";
import type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
} from "@/src/types/note";

const NOTES_KEY = "notes" as const;

export function useNotes() {
  return useQuery({
    queryKey: [NOTES_KEY],
    queryFn: () => noteService.getAll(),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNoteInput) => noteService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) =>
      noteService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
    },
  });
}

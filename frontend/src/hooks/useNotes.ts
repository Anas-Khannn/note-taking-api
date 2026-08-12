import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { noteKeys } from "@/hooks/note.keys";
import { noteService } from "@/services/note.service";
import type { CreateNoteInput, UpdateNoteInput } from "@/types/note.types";

export function useNotes() {
  return useQuery({
    queryKey: noteKeys.list(),
    queryFn: noteService.getAll,
  });
}

export function useNote(id?: string) {
  return useQuery({
    queryKey: noteKeys.detail(id ?? ""),
    queryFn: () => noteService.getOne(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNoteInput) => noteService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) =>
      noteService.update(id, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: noteKeys.detail(variables.id),
      });
    },
  });
}

export function useArchiveNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      noteService.archive(id, archived),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: noteKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteService.remove(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.removeQueries({ queryKey: noteKeys.detail(id) });
    },
  });
}

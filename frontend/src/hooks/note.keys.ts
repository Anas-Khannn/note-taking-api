import type { NoteFilter } from "@/types/note.types";

export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  list: (filters?: NoteFilter) =>
    [...noteKeys.lists(), filters ?? "all"] as const,
  details: () => [...noteKeys.all, "detail"] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
};

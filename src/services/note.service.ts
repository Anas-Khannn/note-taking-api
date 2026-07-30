import { api } from "@/src/lib/api";
import type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  NotesListResponse,
  ApiResponse,
} from "@/src/types/note";

export const noteService = {
  getAll: () => api.get<NotesListResponse>("/note"),

  getById: (id: string) => api.get<ApiResponse<Note>>(`/note/${id}`),

  create: (input: CreateNoteInput) =>
    api.post<ApiResponse<Note>>("/note", input),

  update: (id: string, input: UpdateNoteInput) =>
    api.patch<ApiResponse<Note>>(`/note/${id}`, input),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/note/${id}`),
};

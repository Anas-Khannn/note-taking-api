import { apiRequest } from "@/lib/api";
import type {
  CreateNoteInput,
  DeleteNoteApiResponse,
  Note,
  NoteApiResponse,
  NoteListApiResponse,
  UpdateNoteInput,
} from "@/types/note";

const NOTES_PATH = "/note";

export const noteService = {
  async getAll(): Promise<Note[]> {
    const res = await apiRequest<NoteListApiResponse>(NOTES_PATH);
    return res.data ?? [];
  },

  async create(input: CreateNoteInput): Promise<Note> {
    const res = await apiRequest<NoteApiResponse>(NOTES_PATH, {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.data;
  },

  async update(id: string, input: UpdateNoteInput): Promise<Note> {
    const res = await apiRequest<NoteApiResponse>(`${NOTES_PATH}/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiRequest<DeleteNoteApiResponse>(`${NOTES_PATH}/${id}`, {
      method: "DELETE",
    });
  },
};

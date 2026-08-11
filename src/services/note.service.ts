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

interface RawNote {
  note_id: string;
  title: string;
  content: string;
  status: Note["status"];
  created_at?: string;
  updated_at?: string;
}

function mapNote(raw: RawNote): Note {
  return {
    id: raw.note_id,
    title: raw.title,
    content: raw.content,
    status: raw.status,
    createdAt: raw.created_at ?? raw.updated_at ?? "",
    updatedAt: raw.updated_at ?? raw.created_at ?? "",
  };
}

export const noteService = {
  async getAll(): Promise<Note[]> {
    const res = await apiRequest<NoteListApiResponse>(NOTES_PATH);
    return ((res.data as unknown) as RawNote[] | null ?? []).map(mapNote);
  },

  async create(input: CreateNoteInput): Promise<Note> {
    const res = await apiRequest<NoteApiResponse>(NOTES_PATH, {
      method: "POST",
      body: JSON.stringify(input),
    });
    return mapNote((res.data as unknown) as RawNote);
  },

  async getOne(id: string): Promise<Note> {
    const res = await apiRequest<NoteApiResponse>(`${NOTES_PATH}/${id}`);
    return mapNote((res.data as unknown) as RawNote);
  },

  async update(id: string, input: UpdateNoteInput): Promise<Note> {
    const res = await apiRequest<NoteApiResponse>(`${NOTES_PATH}/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return mapNote((res.data as unknown) as RawNote);
  },

  async archive(id: string, archived: boolean): Promise<Note> {
    return this.update(id, { status: archived ? "ARCHIVED" : "ACTIVE" });
  },

  async remove(id: string): Promise<void> {
    await apiRequest<DeleteNoteApiResponse>(`${NOTES_PATH}/${id}`, {
      method: "DELETE",
    });
  },
};

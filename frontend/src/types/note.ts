export type NoteStatus = "ACTIVE" | "ARCHIVED" | "DELETED";

export interface Note {
  id: string;
  title: string;
  content: string;
  status: NoteStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  status?: NoteStatus;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  status?: NoteStatus;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface NotesListResponse {
  data: Note[];
  total: number;
}

export type NoteStatus = "ACTIVE" | "ARCHIVED" | "DELETED";

export type NoteFilter = "all" | "active" | "archived";

export interface Note {
  note_id: string;
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export type NoteListApiResponse = ApiResponse<Note[]>;

export type NoteApiResponse = ApiResponse<Note> & { data: Note };

export type DeleteNoteApiResponse = ApiResponse;

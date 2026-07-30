"use client";

import { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Select } from "@/src/components/ui/Select";
import { Button } from "@/src/components/ui/Button";
import type { Note, CreateNoteInput, UpdateNoteInput } from "@/src/types/note";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNoteInput | UpdateNoteInput) => void;
  note?: Note | null;
  isSubmitting?: boolean;
}

interface FormErrors {
  title?: string;
  content?: string;
}

function NoteForm({
  note,
  onSubmit,
  isSubmitting,
  onSuccess,
}: {
  note?: Note | null;
  onSubmit: (data: CreateNoteInput | UpdateNoteInput) => void;
  isSubmitting: boolean;
  onSuccess: () => void;
}) {
  const isEditing = !!note;
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [status, setStatus] = useState<"ACTIVE" | "ARCHIVED">(
    (note?.status as "ACTIVE" | "ARCHIVED") ?? "ACTIVE"
  );
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!content.trim()) {
      newErrors.content = "Content is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && note) {
      const input: UpdateNoteInput = {};
      if (title !== note.title) input.title = title.trim();
      if (content !== note.content) input.content = content.trim();
      if (status !== note.status) input.status = status;
      onSubmit(input);
    } else {
      onSubmit({
        title: title.trim(),
        content: content.trim(),
        status,
      } as CreateNoteInput);
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Title"
        placeholder="Enter note title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (errors.title)
            setErrors((prev) => ({ ...prev, title: undefined }));
        }}
        error={errors.title}
        disabled={isSubmitting}
      />

      <Textarea
        label="Content"
        placeholder="Write your note content..."
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (errors.content)
            setErrors((prev) => ({ ...prev, content: undefined }));
        }}
        error={errors.content}
        disabled={isSubmitting}
      />

      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as "ACTIVE" | "ARCHIVED")}
        options={[
          { value: "ACTIVE", label: "Active" },
          { value: "ARCHIVED", label: "Archived" },
        ]}
        disabled={isSubmitting}
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          Discard Changes
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
            ? "Save Changes"
            : "Create Note"}
        </Button>
      </div>
    </form>
  );
}

export function NoteModal(props: NoteModalProps) {
  const { isOpen, onClose, note, isSubmitting, onSubmit } = props;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={note ? "Edit Note" : "Create Note"}
    >
      {isOpen && (
        <NoteForm
          key={note?.id ?? "new"}
          note={note}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting ?? false}
          onSuccess={onClose}
        />
      )}
    </Modal>
  );
}

"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useCreateNote, useUpdateNote } from "@/hooks/useNotes";
import { getErrorMessage } from "@/lib/api";
import type { CreateNoteInput, Note, NoteStatus } from "@/types/note";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" },
];

interface NoteModalProps {
  open: boolean;
  mode: "create" | "edit";
  note?: Note | null;
  onClose: () => void;
}

interface FormErrors {
  title?: string;
  content?: string;
}

export function NoteModal({
  open,
  mode,
  note,
  onClose,
}: NoteModalProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [status, setStatus] = useState<NoteStatus>(
    note?.status === "ARCHIVED" ? "ARCHIVED" : "ACTIVE"
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;

  const titleId = useId();
  const contentId = useId();
  const statusId = useId();
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const isEdit = mode === "edit";
  const titleErrorId = errors.title ? `${titleId}-error` : undefined;
  const contentErrorId = errors.content ? `${contentId}-error` : undefined;

  const resetForm = () => {
    setTitle("");
    setContent("");
    setStatus("ACTIVE");
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const nextErrors: FormErrors = {};

    if (!trimmedTitle) {
      nextErrors.title = "Note title is required";
    } else if (trimmedTitle.length > 100) {
      nextErrors.title = "Note title cannot exceed 100 characters";
    }

    if (!trimmedContent) {
      nextErrors.content = "Note content is required";
    }

    setErrors(nextErrors);

    if (nextErrors.title || nextErrors.content) {
      return;
    }

    const input: CreateNoteInput = {
      title: trimmedTitle,
      content: trimmedContent,
      status,
    };

    try {
      if (isEdit && note) {
        await updateMutation.mutateAsync({ id: note.id, input });
      } else {
        await createMutation.mutateAsync(input);
      }
      resetForm();
      onClose();
    } catch {
      // The failure stays available through mutation.error and the modal
      // stays open so the user can retry.
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit note" : "Create note"}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div>
          <label
            htmlFor={titleId}
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Title
          </label>
          <Input
            ref={titleRef}
            id={titleId}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            invalid={Boolean(errors.title)}
            aria-describedby={titleErrorId}
            placeholder="Give your note a title"
            maxLength={100}
          />
          {errors.title && (
            <p id={titleErrorId} role="alert" className="mt-1.5 text-xs text-error">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={contentId}
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Content
          </label>
          <Textarea
            id={contentId}
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              if (errors.content) {
                setErrors((prev) => ({ ...prev, content: undefined }));
              }
            }}
            invalid={Boolean(errors.content)}
            aria-describedby={contentErrorId}
            placeholder="Write your thoughts here..."
            rows={5}
          />
          {errors.content && (
            <p id={contentErrorId} role="alert" className="mt-1.5 text-xs text-error">
              {errors.content}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={statusId}
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Status
          </label>
          <Select
            id={statusId}
            value={status}
            onChange={(event) => setStatus(event.target.value as NoteStatus)}
            options={STATUS_OPTIONS}
          />
        </div>

        {mutationError && (
          <div
            role="alert"
            className="rounded-memo-md bg-error-container px-4 py-3 text-sm font-medium text-error"
          >
            {getErrorMessage(mutationError)}
          </div>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Discard Changes
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            leftIcon={
              !isSubmitting && !isEdit ? (
                <Plus size={18} strokeWidth={2} />
              ) : undefined
            }
          >
            {isEdit ? "Save Changes" : "Create Note"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { useDeleteNote } from "@/hooks/useNotes";
import { getErrorMessage } from "@/lib/api";
import type { Note } from "@/types/note";

interface DeleteNoteDialogProps {
  open: boolean;
  note?: Note | null;
  onClose: () => void;
}

export function DeleteNoteDialog({ open, note, onClose }: DeleteNoteDialogProps) {
  const deleteMutation = useDeleteNote();
  const isDeleting = deleteMutation.isPending;

  if (!open || !note) return null;

  const handleConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(note.note_id);
      onClose();
    } catch {
      // The failure stays available through deleteMutation.error and the
      // dialog stays open so the user can retry.
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      ariaLabel="Delete note confirmation"
      header={
        <div className="w-full">
          <div className="h-1 w-full bg-error" />
          <div className="flex items-start justify-between gap-3 px-6 pb-2 pt-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-error-container">
                <AlertTriangle
                  size={20}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="text-error"
                />
              </span>
              <h2 className="text-lg font-semibold text-ink">
                Delete this note?
              </h2>
            </div>
            <IconButton label="Close dialog" icon={X} onClick={onClose} />
          </div>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-ink-secondary">
        The note <span className="font-semibold text-ink">“{note.title}”</span>{" "}
        will be permanently deleted. This action cannot be undone.
      </p>

      {deleteMutation.error && (
        <div
          role="alert"
          className="mt-4 rounded-memo-md bg-error-container px-4 py-3 text-sm font-medium text-error"
        >
          {getErrorMessage(deleteMutation.error)}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="ghost"
          type="button"
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          type="button"
          loading={isDeleting}
          leftIcon={
            !isDeleting ? <Trash2 size={18} strokeWidth={2} /> : undefined
          }
          onClick={handleConfirm}
        >
          Delete Note
        </Button>
      </div>
    </Modal>
  );
}

"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import type { Note } from "@/src/types/note";

interface DeleteNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  note: Note | null;
  isDeleting?: boolean;
}

export function DeleteNoteDialog({
  isOpen,
  onClose,
  onConfirm,
  note,
  isDeleting = false,
}: DeleteNoteDialogProps) {
  if (!note) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete this note?">
      <div className="flex flex-col items-center text-center pt-2">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertTriangle size={24} className="text-red-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Delete this note?
        </h3>

        <p className="text-sm text-gray-600 mb-6 max-w-sm">
          Are you sure you want to delete &ldquo;{note.title}&rdquo;? This
          action cannot be undone.
        </p>

        <div className="flex items-center gap-3 w-full">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1"
          >
            <Trash2 size={16} />
            {isDeleting ? "Deleting..." : "Delete Note"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

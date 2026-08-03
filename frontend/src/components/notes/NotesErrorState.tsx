"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ApiError, getErrorMessage } from "@/lib/api";

interface NotesErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

export function NotesErrorState({ error, onRetry }: NotesErrorStateProps) {
  const code =
    error instanceof ApiError && error.status > 0
      ? `HTTP ${error.status}`
      : "NETWORK ERROR";

  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-error-container">
        <AlertTriangle
          size={36}
          strokeWidth={1.6}
          aria-hidden="true"
          className="text-error"
        />
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-ink">Sync Interrupted</h2>
      <p className="mt-2 max-w-sm text-base text-ink-secondary">
        {getErrorMessage(error)}
      </p>
      <code className="mt-4 rounded-memo-md bg-input-bg px-3 py-1 text-xs font-semibold text-ink-secondary">
        {code}
      </code>
      <Button
        className="mt-6"
        leftIcon={<RefreshCw size={18} strokeWidth={2} />}
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  );
}

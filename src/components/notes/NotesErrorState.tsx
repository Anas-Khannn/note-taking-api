"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

interface NotesErrorStateProps {
  message?: string;
  code?: string;
  onRetry: () => void;
}

export function NotesErrorState({
  message,
  code,
  onRetry,
}: NotesErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Sync Interrupted
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mb-2">
        {message || "We couldn&apos;t load your notes. Please try again."}
      </p>
      {code && (
        <p className="text-xs text-gray-400 font-mono mb-4">Error: {code}</p>
      )}
      {!code && <div className="mb-4" />}
      <Button onClick={onRetry} variant="primary">
        Try Again
      </Button>
    </div>
  );
}

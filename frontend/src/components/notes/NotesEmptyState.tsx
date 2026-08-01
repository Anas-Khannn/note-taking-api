"use client";

import { FileText } from "lucide-react";

interface NotesEmptyStateProps {
  isSearching?: boolean;
  searchQuery?: string;
}

export function NotesEmptyState({
  isSearching = false,
  searchQuery = "",
}: NotesEmptyStateProps) {
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <FileText size={28} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No notes found
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          No notes match &ldquo;{searchQuery}&rdquo;. Try a different search
          term.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
        <FileText size={28} className="text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        No notes yet
      </h3>
      <p className="text-sm text-gray-500 max-w-sm">
        Create your first note to get started.
      </p>
    </div>
  );
}

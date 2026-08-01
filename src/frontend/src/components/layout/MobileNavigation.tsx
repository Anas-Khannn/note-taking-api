"use client";

import { Plus } from "lucide-react";

interface MobileNavigationProps {
  onAddNote: () => void;
}

export function MobileNavigation({ onAddNote }: MobileNavigationProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 lg:hidden">
      <button
        type="button"
        onClick={onAddNote}
        aria-label="Add new note"
        className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors active:scale-95"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

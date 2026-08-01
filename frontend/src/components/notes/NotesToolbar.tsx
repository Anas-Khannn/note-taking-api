"use client";

import { Search } from "lucide-react";

interface NotesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (value: string) => void;
  totalCount: number;
}

export function NotesToolbar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  totalCount,
}: NotesToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          aria-label="Search notes"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <select
          value={activeFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full sm:w-auto rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          aria-label="Filter notes by status"
        >
          <option value="all">All Notes</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <span className="text-sm text-gray-500 whitespace-nowrap hidden sm:inline">
          {totalCount} {totalCount === 1 ? "note" : "notes"}
        </span>
      </div>
    </div>
  );
}

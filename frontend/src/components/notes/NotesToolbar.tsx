"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { NoteFilter } from "@/types/note.types";

const FILTER_OPTIONS = [
  { value: "all", label: "All Notes" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

interface NotesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: NoteFilter;
  onFilterChange: (filter: NoteFilter) => void;
  totalCount: number;
}

export function NotesToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  totalCount,
}: NotesToolbarProps) {
  return (
    <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="relative w-full lg:max-w-sm">
        <Search
          size={20}
          strokeWidth={1.8}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search your notes..."
          aria-label="Search notes"
          className="rounded-full pl-12"
        />
      </div>

      <div className="flex items-center justify-between gap-4 lg:ml-auto">
        <label className="sr-only" htmlFor="note-filter">
          Filter notes
        </label>
        <Select
          id="note-filter"
          value={filter}
          onChange={(event) => onFilterChange(event.target.value as NoteFilter)}
          options={FILTER_OPTIONS}
          className="w-40"
        />
        <p className="shrink-0 text-xs font-semibold tracking-wider text-ink-muted">
          {totalCount} TOTAL
        </p>
      </div>
    </div>
  );
}

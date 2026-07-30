"use client";

import { NotebookPen, Plus, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { IconButton } from "@/src/components/ui/IconButton";
import { Button } from "@/src/components/ui/Button";

interface NavbarProps {
  onAddNote: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

export function Navbar({
  onAddNote,
  searchQuery,
  onSearchChange,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="flex items-center gap-2">
              <NotebookPen size={22} className="text-indigo-600" />
              <span className="text-xl font-semibold text-gray-900 hidden sm:inline">
                MemoNest
              </span>
            </div>

            <nav className="hidden lg:flex items-center ml-8 gap-1">
              <a
                href="#"
                className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg transition-colors"
              >
                All Notes
              </a>
              <a
                href="#"
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Archived
              </a>
            </nav>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                aria-label="Search notes"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <Button onClick={onAddNote}>
                <Plus size={16} />
                Add Note
              </Button>
            </div>

            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-semibold">
              U
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-3 space-y-1">
            <a
              href="#"
              className="block px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg"
            >
              All Notes
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              Archived
            </a>
          </div>
        )}
      </div>
    </header>
  );
}

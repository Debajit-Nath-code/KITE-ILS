import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Bookmark as BookmarkIcon, 
  BookmarkCheck, 
  Search, 
  Settings, 
  Menu, 
  X, 
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Button } from '../ui/Button';
import { ReaderSettings } from '../../services/readingProgressService';

export interface ReaderTopBarProps {
  bookTitle: string;
  chapterTitle: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onExit: () => void;
  onSearchQuery?: (q: string) => void;
}

export const ReaderTopBar: React.FC<ReaderTopBarProps> = ({
  bookTitle,
  chapterTitle,
  isBookmarked,
  onToggleBookmark,
  onOpenSettings,
  onToggleSidebar,
  isSidebarOpen,
  onExit,
  onSearchQuery,
}) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchQuery && searchInput.trim()) {
      onSearchQuery(searchInput.trim());
    }
  };

  return (
    <header className="h-14 border-b border-inherit px-3 sm:px-6 flex items-center justify-between select-none shrink-0 transition-colors z-30">
      {/* Left: Sidebar Toggle & Exit */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-inherit"
          title={isSidebarOpen ? 'Close Table of Contents' : 'Open Table of Contents'}
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-medium py-1.5 px-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-inherit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exit Reader</span>
        </button>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-inherit opacity-60 pl-2 border-l border-inherit">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="truncate max-w-[200px] lg:max-w-xs font-serif font-medium">{bookTitle}</span>
        </div>
      </div>

      {/* Center: Current Chapter Title */}
      <div className="flex-1 text-center px-4 min-w-0">
        {!isSearchActive ? (
          <div className="truncate">
            <span className="text-xs sm:text-sm font-serif font-semibold tracking-tight block truncate">
              {chapterTitle}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSearchSubmit} className="max-w-sm mx-auto flex items-center gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search terms, theorems, code..."
              autoFocus
              className="w-full h-8 px-2.5 text-xs rounded-md bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-inherit focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button
              type="button"
              onClick={() => {
                setIsSearchActive(false);
                setSearchInput('');
              }}
              className="text-xs opacity-60 hover:opacity-100 p-1"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Right: Search, Bookmark, Settings */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* In-Book Search Toggle */}
        <button
          type="button"
          onClick={() => setIsSearchActive((prev) => !prev)}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isSearchActive
              ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300'
              : 'hover:bg-black/5 dark:hover:bg-white/10 text-inherit'
          }`}
          title="Search in Monograph"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Bookmark Toggle */}
        <button
          type="button"
          onClick={onToggleBookmark}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isBookmarked
              ? 'text-sky-600 dark:text-sky-400 bg-sky-500/15'
              : 'hover:bg-black/5 dark:hover:bg-white/10 text-inherit opacity-75 hover:opacity-100'
          }`}
          title={isBookmarked ? 'Remove Bookmark from this page' : 'Bookmark this page'}
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-4 h-4 fill-sky-600/30" />
          ) : (
            <BookmarkIcon className="w-4 h-4" />
          )}
        </button>

        {/* Reader Display Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-inherit"
          title="Reader Display Settings (Theme, Font, Spacing)"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

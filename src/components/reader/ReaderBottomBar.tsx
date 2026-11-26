import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, BookOpen } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ReaderBottomBarProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onJumpToPage: (page: number) => void;
}

export const ReaderBottomBar: React.FC<ReaderBottomBarProps> = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onJumpToPage,
}) => {
  const percentage = Math.round((currentPage / totalPages) * 100);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageInput, setPageInput] = useState(currentPage.toString());

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      onJumpToPage(parsed);
      setIsEditingPage(false);
    } else {
      setPageInput(currentPage.toString());
      setIsEditingPage(false);
    }
  };

  return (
    <footer className="h-16 border-t border-inherit px-2 sm:px-6 flex items-center justify-between select-none shrink-0 transition-colors z-30">
      {/* Previous Page Button */}
      <button
        type="button"
        onClick={onPrevPage}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className={`
          min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-inherit
          ${
            currentPage <= 1
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-black/5 dark:hover:bg-white/10 active:scale-95'
          }
        `}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Center: Interactive Page Slider & Indicator */}
      <div className="flex flex-col items-center justify-center max-w-xs sm:max-w-md w-full px-2 sm:px-4">
        {/* Page progress bar */}
        <div className="w-full h-1 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden mb-1.5 cursor-pointer relative group">
          <div
            className="h-full bg-sky-600 rounded-full transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Page Counter & Percentage */}
        <div className="flex items-center gap-2 text-xs">
          {!isEditingPage ? (
            <button
              type="button"
              onClick={() => {
                setPageInput(currentPage.toString());
                setIsEditingPage(true);
              }}
              className="min-h-[32px] md:min-h-0 px-1.5 hover:underline font-mono text-inherit font-medium cursor-pointer"
              title="Click to jump to page number"
            >
              Page <span className="font-bold">{currentPage}</span> of <span>{totalPages}</span>
            </button>
          ) : (
            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
              <span className="font-mono text-xs">Page</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                autoFocus
                onBlur={() => setIsEditingPage(false)}
                className="w-14 sm:w-12 h-8 sm:h-6 px-1 text-center font-mono text-base md:text-xs rounded bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 text-inherit focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <span className="font-mono text-xs">of {totalPages}</span>
            </form>
          )}

          <span className="opacity-40">·</span>

          <span className="font-mono text-[11px] font-semibold text-sky-600 dark:text-sky-400">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Next Page Button */}
      <button
        type="button"
        onClick={onNextPage}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className={`
          min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-inherit
          ${
            currentPage >= totalPages
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-black/5 dark:hover:bg-white/10 active:scale-95'
          }
        `}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </footer>
  );
};

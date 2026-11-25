import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  Layers, 
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface FilterOptions {
  subject: string;
  availability: 'all' | 'available_now' | 'digital_only';
  libraryWing: string;
  format: 'all' | 'physical' | 'ebook';
}

interface SidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  subjects: string[];
  libraries: string[];
  totalMatches?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  filters,
  onFilterChange,
  subjects,
  libraries,
  totalMatches,
  isOpen = true,
  onClose,
}) => {
  const resetFilters = () => {
    onFilterChange({
      subject: 'All Disciplines',
      availability: 'all',
      libraryWing: 'All Libraries',
      format: 'all',
    });
  };

  const hasActiveFilters =
    filters.subject !== 'All Disciplines' ||
    filters.availability !== 'all' ||
    filters.libraryWing !== 'All Libraries' ||
    filters.format !== 'all';

  const content = (
    <aside className="w-full space-y-6 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-700" />
          <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
            Catalog Facets
          </span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 hover:text-sky-900 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Real-Time Shelf Availability */}
      <div>
        <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
          Shelf Availability
        </label>
        <div className="space-y-1.5">
          {[
            { id: 'all', label: 'All Catalog Records' },
            { id: 'available_now', label: 'On Shelf Right Now', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> },
            { id: 'digital_only', label: 'Instant Digital Access', icon: <Sparkles className="w-3.5 h-3.5 text-sky-600" /> },
          ].map((item) => (
            <label
              key={item.id}
              className={`
                flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors
                ${
                  filters.availability === item.id
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              <input
                type="radio"
                name="availability"
                value={item.id}
                checked={filters.availability === item.id}
                onChange={() => onFilterChange({ ...filters, availability: item.id as any })}
                className="sr-only"
              />
              {item.icon}
              <span className="truncate">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Academic Discipline */}
      <div>
        <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
          Academic Subject
        </label>
        <div className="space-y-1">
          {['All Disciplines', ...subjects].map((subject) => {
            const isSelected = filters.subject === subject;
            return (
              <button
                key={subject}
                type="button"
                onClick={() => onFilterChange({ ...filters, subject })}
                className={`
                  w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between
                  ${
                    isSelected
                      ? 'bg-sky-50 text-sky-900 font-semibold border-l-2 border-sky-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <span className="truncate">{subject}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Library Location / Building */}
      <div>
        <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
          Campus Library
        </label>
        <div className="space-y-1">
          {['All Libraries', ...libraries].map((lib) => {
            const isSelected = filters.libraryWing === lib;
            return (
              <button
                key={lib}
                type="button"
                onClick={() => onFilterChange({ ...filters, libraryWing: lib })}
                className={`
                  w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2
                  ${
                    isSelected
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{lib}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Format */}
      <div>
        <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
          Format & Medium
        </label>
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
          {(['all', 'physical', 'ebook'] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => onFilterChange({ ...filters, format: fmt })}
              className={`
                py-1 text-[11px] font-medium rounded capitalize transition-colors
                ${
                  filters.format === fmt
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }
              `}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {typeof totalMatches === 'number' && (
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 tabular-nums">
          Displaying {totalMatches} curated catalog items
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">{content}</div>

      {/* Mobile Drawer */}
      {isOpen && onClose && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <span className="font-serif text-lg font-medium text-slate-900">Filters</span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
};

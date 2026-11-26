import React, { useState } from 'react';
import { 
  BookOpen, 
  Bookmark as BookmarkIcon, 
  FileText, 
  X, 
  Trash2, 
  Plus, 
  ChevronRight, 
  Calendar,
  Check
} from 'lucide-react';
import { ChapterOutline } from '../../data/readerMockData';
import { Bookmark, ReadingNote } from '../../services/readingProgressService';
import { Button } from '../ui/Button';

export interface ReaderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: ChapterOutline[];
  currentPage: number;
  bookmarks: Bookmark[];
  notes: ReadingNote[];
  onSelectPage: (page: number) => void;
  onRemoveBookmark: (page: number) => void;
  onAddNote: (content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export const ReaderSidebar: React.FC<ReaderSidebarProps> = ({
  isOpen,
  onClose,
  chapters,
  currentPage,
  bookmarks,
  notes,
  onSelectPage,
  onRemoveBookmark,
  onAddNote,
  onDeleteNote,
}) => {
  const [activeTab, setActiveTab] = useState<'toc' | 'bookmarks' | 'notes'>('toc');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!isOpen) return null;

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteContent.trim()) {
      onAddNote(newNoteContent.trim());
      setNewNoteContent('');
      setIsAddingNote(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-[min(20rem,100vw)] sm:w-96 h-[100dvh] bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 shadow-2xl flex flex-col select-none text-slate-900 dark:text-slate-100 transition-transform animate-in slide-in-from-left duration-200">
      {/* Sidebar Header & Tab Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="font-serif font-semibold text-sm tracking-tight">
            Monograph Explorer
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center p-2 md:p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons: TOC | Bookmarks | Notes */}
        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('toc')}
            className={`flex-1 min-h-[40px] md:min-h-0 py-1.5 px-2 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'toc'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Contents</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 min-h-[40px] md:min-h-0 py-1.5 px-2 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookmarkIcon className="w-3.5 h-3.5" />
            <span>Marks ({bookmarks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`flex-1 min-h-[40px] md:min-h-0 py-1.5 px-2 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes ({notes.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* ================================================================= */}
        {/* TAB 1: TABLE OF CONTENTS                                          */}
        {/* ================================================================= */}
        {activeTab === 'toc' && (
          <div className="space-y-3">
            {chapters.map((ch) => {
              const isCurrentChapter = currentPage >= ch.startPage && currentPage <= ch.endPage;

              return (
                <div key={ch.id} className="space-y-1">
                  {/* Chapter Header */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage(ch.startPage);
                      onClose();
                    }}
                    className={`
                      w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start justify-between gap-2 cursor-pointer
                      ${
                        isCurrentChapter
                          ? 'bg-sky-50 dark:bg-sky-950/60 border border-sky-300/80 dark:border-sky-800 text-sky-950 dark:text-sky-200'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                      }
                    `}
                  >
                    <div>
                      <span className="font-mono text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase block">
                        Chapter {ch.number}
                      </span>
                      <span className="font-serif font-medium text-xs block mt-0.5 leading-snug">
                        {ch.title}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 shrink-0 mt-0.5">
                      p. {ch.startPage}
                    </span>
                  </button>

                  {/* Sub-sections */}
                  <div className="pl-4 space-y-0.5 border-l border-slate-200/80 dark:border-slate-800 ml-2">
                    {ch.sections.map((sec) => {
                      const isCurrentSec = currentPage === sec.page;
                      return (
                        <button
                          key={sec.title}
                          type="button"
                          onClick={() => {
                            onSelectPage(sec.page);
                            onClose();
                          }}
                          className={`
                            w-full text-left py-1.5 px-2 rounded text-[11px] flex items-center justify-between transition-colors cursor-pointer
                            ${
                              isCurrentSec
                                ? 'font-semibold text-sky-600 dark:text-sky-400 bg-sky-50/50'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }
                          `}
                        >
                          <span className="truncate">{sec.title}</span>
                          <span className="font-mono text-[10px] opacity-60 ml-1">p.{sec.page}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: BOOKMARKS LIST                                             */}
        {/* ================================================================= */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-3">
            {bookmarks.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                <BookmarkIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No saved bookmarks yet.</p>
                <p className="text-[11px] mt-1">Tap the bookmark icon in the top bar to save pages.</p>
              </div>
            ) : (
              bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase">
                      Page {bm.pageNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveBookmark(bm.pageNumber)}
                      className="min-w-[40px] min-h-[40px] md:min-w-0 md:min-h-0 flex items-center justify-center text-slate-400 hover:text-rose-600 p-2 md:p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Delete bookmark"
                      aria-label="Delete bookmark"
                    >
                      <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                    </button>
                  </div>

                  <p className="font-serif text-xs italic text-slate-700 dark:text-slate-300 line-clamp-2">
                    "{bm.snippet}"
                  </p>

                  <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 truncate max-w-[180px]">{bm.chapterTitle}</span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPage(bm.pageNumber);
                        onClose();
                      }}
                      className="text-sky-600 dark:text-sky-400 font-medium hover:underline text-[11px] cursor-pointer"
                    >
                      Jump to page →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: NOTES & ANNOTATIONS                                        */}
        {/* ================================================================= */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* Add Note Button / Form */}
            {!isAddingNote ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsAddingNote(true)}
              >
                Add Note on Page {currentPage}
              </Button>
            ) : (
              <form onSubmit={handleSaveNote} className="p-3 bg-amber-50/60 dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-200 block">
                  New Annotation (Page {currentPage})
                </span>
                <textarea
                  rows={3}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record research thoughts, formulas, or review notes..."
                  autoFocus
                  className="w-full p-2 text-xs rounded border border-amber-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-inherit focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      setIsAddingNote(false);
                      setNewNoteContent('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" className="text-xs h-7">
                    Save Note
                  </Button>
                </div>
              </form>
            )}

            {/* Existing Notes List */}
            {notes.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No study notes recorded yet.</p>
                <p className="text-[11px] mt-1">Annotate passages to synchronize with your student dashboard.</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg border border-amber-200/80 dark:border-amber-950/60 bg-amber-50/40 dark:bg-slate-800/80 text-xs space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-amber-800 dark:text-amber-300">
                      Page {note.pageNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteNote(note.id)}
                      className="min-w-[40px] min-h-[40px] md:min-w-0 md:min-h-0 flex items-center justify-center text-slate-400 hover:text-rose-600 p-2 md:p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Delete note"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                    </button>
                  </div>

                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                    {note.content}
                  </p>

                  <div className="pt-1 border-t border-amber-100 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{note.updatedAt}</span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPage(note.pageNumber);
                        onClose();
                      }}
                      className="text-sky-600 dark:text-sky-400 font-medium hover:underline cursor-pointer"
                    >
                      Go to page →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

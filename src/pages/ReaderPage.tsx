import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ReadingProgressService, 
  ReadingProgress, 
  Bookmark, 
  ReadingNote, 
  ReaderSettings 
} from '../services/readingProgressService';
import { 
  DATA_STRUCTURES_CHAPTERS, 
  getPageContent 
} from '../data/readerMockData';
import { LibraryService } from '../services/mockLibraryService';
import { ReaderTopBar } from '../components/reader/ReaderTopBar';
import { ReaderBottomBar } from '../components/reader/ReaderBottomBar';
import { ReaderSidebar } from '../components/reader/ReaderSidebar';
import { ReaderContent } from '../components/reader/ReaderContent';
import { ReaderResumeModal } from '../components/reader/ReaderResumeModal';
import { ReaderSettingsModal } from '../components/reader/ReaderSettingsModal';
import { useToast } from '../components/ui/Toast';

export const ReaderPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const activeBookId = bookId || 'bk-cs-04';

  // Core Reader State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages] = useState<number>(318);
  const [bookTitle, setBookTitle] = useState<string>('Data Structures Using C');
  const [bookAuthor, setBookAuthor] = useState<string>('Reema Thareja');
  const [callNumber, setCallNumber] = useState<string>('QA76.73 .C15 D38 2023');

  // Modals & Panels
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [resumePrompt, setResumePrompt] = useState<ReadingProgress | null>(null);

  // Settings, Bookmarks, and Notes
  const [settings, setSettings] = useState<ReaderSettings>(() =>
    ReadingProgressService.getSettings()
  );
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<ReadingNote[]>([]);

  // 1. Initial Load: Retrieve Book Info & Check for Saved Reading Progress
  useEffect(() => {
    let isCurrent = true;

    // Fetch Book Metadata
    LibraryService.getBookById(activeBookId).then((found) => {
      if (!isCurrent) return;
      if (found) {
        setBookTitle(found.title);
        setBookAuthor(found.author);
        setCallNumber(found.location.callNumber);
      }
    });

    // Fetch Saved Progress
    ReadingProgressService.getProgress(activeBookId).then((saved) => {
      if (!isCurrent) return;
      if (saved && saved.currentPage > 1) {
        setResumePrompt(saved);
      } else {
        setCurrentPage(1);
      }
    });

    // Fetch Bookmarks & Notes
    ReadingProgressService.getBookmarks(activeBookId).then((bms) => {
      if (isCurrent) setBookmarks(bms);
    });

    ReadingProgressService.getNotes(activeBookId).then((nts) => {
      if (isCurrent) setNotes(nts);
    });

    return () => {
      isCurrent = false;
    };
  }, [activeBookId]);

  // Current page text content
  const pageContent = getPageContent(currentPage);

  // Check if current page is bookmarked
  const isCurrentPageBookmarked = bookmarks.some((b) => b.pageNumber === currentPage);

  // Ref to debounce toast notifications during rapid page turns
  const lastToastTimeRef = useRef<number>(0);

  // 2. Persist Reading Progress whenever current page changes
  const saveCurrentProgress = useCallback(
    async (pageToSave: number, notify = false) => {
      const percentage = Math.round((pageToSave / totalPages) * 100);
      const ch = DATA_STRUCTURES_CHAPTERS.find(
        (c) => pageToSave >= c.startPage && pageToSave <= c.endPage
      ) || DATA_STRUCTURES_CHAPTERS[0];

      await ReadingProgressService.saveProgress({
        bookId: activeBookId,
        bookTitle,
        bookAuthor,
        chapter: `Chapter ${ch.number}: ${ch.title}`,
        chapterIndex: ch.number - 1,
        currentPage: pageToSave,
        totalPages,
        progressPercentage: percentage,
        lastOpened: 'Just now',
        lastOpenedTimestamp: Date.now(),
        callNumber,
      });

      const now = Date.now();
      if (notify || now - lastToastTimeRef.current > 6000) {
        lastToastTimeRef.current = now;
        toast.success(
          'Reading Progress Saved',
          `Saved at Page ${pageToSave} (${percentage}% complete). Synced with dashboard.`
        );
      }
    },
    [activeBookId, bookTitle, bookAuthor, totalPages, callNumber, toast]
  );

  // Handlers for page navigation
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      saveCurrentProgress(newPage);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (resumePrompt || isSettingsOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'Escape') {
        if (isSidebarOpen) {
          setIsSidebarOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, resumePrompt, isSettingsOpen, isSidebarOpen]);

  // Bookmarking handler
  const handleToggleBookmark = async () => {
    if (isCurrentPageBookmarked) {
      await ReadingProgressService.removeBookmark(activeBookId, currentPage);
      setBookmarks((prev) => prev.filter((b) => b.pageNumber !== currentPage));
      toast.info('Bookmark Removed', `Page ${currentPage} bookmark removed.`);
    } else {
      const snippet = pageContent.content.find((c) => c.type === 'paragraph')?.text?.slice(0, 100) || pageContent.sectionTitle;
      const created = await ReadingProgressService.addBookmark({
        bookId: activeBookId,
        pageNumber: currentPage,
        chapterTitle: pageContent.chapterTitle,
        snippet,
      });
      setBookmarks((prev) => [created, ...prev]);
      toast.success('Bookmark Added', `Saved bookmark on Page ${currentPage}.`);
    }
  };

  // Notes handler
  const handleAddNote = async (content: string) => {
    const created = await ReadingProgressService.addNote({
      bookId: activeBookId,
      pageNumber: currentPage,
      chapterTitle: pageContent.chapterTitle,
      content,
      color: 'yellow',
    });
    setNotes((prev) => [created, ...prev]);
    toast.success('Annotation Saved', `Note recorded for Page ${currentPage}.`);
  };

  const handleDeleteNote = async (noteId: string) => {
    await ReadingProgressService.deleteNote(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    toast.info('Note Deleted', 'Annotation removed from monograph.');
  };

  // Settings update handler
  const handleUpdateSettings = (updated: Partial<ReaderSettings>) => {
    const next = ReadingProgressService.saveSettings(updated);
    setSettings(next);
  };

  // In-book search handler
  const handleSearchQuery = (q: string) => {
    const cleanQ = q.toLowerCase();
    // Search chapters and sections
    const match = DATA_STRUCTURES_CHAPTERS.find(
      (c) =>
        c.title.toLowerCase().includes(cleanQ) ||
        c.sections.some((s) => s.title.toLowerCase().includes(cleanQ))
    );

    if (match) {
      const secMatch = match.sections.find((s) => s.title.toLowerCase().includes(cleanQ));
      const targetPage = secMatch ? secMatch.page : match.startPage;
      handlePageChange(targetPage);
      toast.info('Result Found', `Jumped to Page ${targetPage} for "${q}".`);
    } else if (cleanQ.includes('avl') || cleanQ.includes('tree') || cleanQ.includes('rotat')) {
      handlePageChange(87);
      toast.info('Result Found', 'Jumped to Page 87 (AVL Self-Balancing Trees).');
    } else {
      toast.info('No Matches', `No textbook sections found matching "${q}".`);
    }
  };

  // Exit reader handler
  const handleExitReader = () => {
    saveCurrentProgress(currentPage, true);
    navigate(-1);
  };

  // Theme styling map
  const themeClass = {
    paper: 'bg-white text-slate-900 border-slate-200/90',
    sepia: 'bg-[#fbf8f1] text-[#292524] border-[#e7dfd1]',
    dark: 'bg-[#0b0f19] text-[#e2e8f0] border-slate-800',
  }[settings.theme];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col overflow-hidden ${themeClass} transition-colors duration-200`}>
      {/* 1. TOP BAR */}
      <ReaderTopBar
        bookTitle={bookTitle}
        chapterTitle={pageContent.chapterTitle}
        isBookmarked={isCurrentPageBookmarked}
        onToggleBookmark={handleToggleBookmark}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        onExit={handleExitReader}
        onSearchQuery={handleSearchQuery}
      />

      {/* 2. MAIN READING AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Table of Contents & Annotations Sidebar */}
        <ReaderSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          chapters={DATA_STRUCTURES_CHAPTERS}
          currentPage={currentPage}
          bookmarks={bookmarks}
          notes={notes}
          onSelectPage={handlePageChange}
          onRemoveBookmark={(p) => {
            ReadingProgressService.removeBookmark(activeBookId, p);
            setBookmarks((prev) => prev.filter((b) => b.pageNumber !== p));
          }}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
        />

        {/* Distraction-Free Page Reading Canvas */}
        <ReaderContent
          page={pageContent}
          settings={settings}
          bookTitle={bookTitle}
          totalPages={totalPages}
        />
      </div>

      {/* 3. BOTTOM CONTROLS */}
      <ReaderBottomBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onJumpToPage={handlePageChange}
      />

      {/* 4. "WELCOME BACK / CONTINUE FROM PAGE X?" RESUME MODAL */}
      {resumePrompt && (
        <ReaderResumeModal
          isOpen={Boolean(resumePrompt)}
          progress={resumePrompt}
          onContinue={() => {
            handlePageChange(resumePrompt.currentPage);
            setResumePrompt(null);
            toast.success(
              'Reading Resumed',
              `Welcome back! Position restored to Page ${resumePrompt.currentPage}.`
            );
          }}
          onStartFromBeginning={() => {
            handlePageChange(1);
            setResumePrompt(null);
          }}
          onClose={() => {
            setResumePrompt(null);
          }}
        />
      )}

      {/* 5. READER APPEARANCE SETTINGS MODAL */}
      <ReaderSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
};

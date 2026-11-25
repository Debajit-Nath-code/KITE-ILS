/**
 * Kite ILS - Reading Progress & Smart Sync Service
 * Abstracted persistence layer for student reading states, bookmarks, and academic annotations.
 * Designed for seamless transition from localStorage to cloud APIs or Firestore.
 */

export interface ReadingProgress {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  chapter: string;
  chapterIndex: number;
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
  lastOpened: string;
  lastOpenedTimestamp: number;
  callNumber?: string;
  cover?: string;
}

export interface Bookmark {
  id: string;
  bookId: string;
  pageNumber: number;
  chapterTitle: string;
  snippet: string;
  createdAt: string;
}

export interface ReadingNote {
  id: string;
  bookId: string;
  pageNumber: number;
  chapterTitle: string;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'purple';
  updatedAt: string;
}

export interface ReaderSettings {
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: 'serif' | 'sans';
  lineHeight: 'tight' | 'normal' | 'relaxed';
  theme: 'paper' | 'sepia' | 'dark';
}

const STORAGE_KEY_PROGRESS = 'kite_ils_reading_progress_v1';
const STORAGE_KEY_BOOKMARKS = 'kite_ils_reader_bookmarks_v1';
const STORAGE_KEY_NOTES = 'kite_ils_reader_notes_v1';
const STORAGE_KEY_SETTINGS = 'kite_ils_reader_settings_v1';

// Initial baseline mock reading progress matching user prompt
export const INITIAL_DEFAULT_PROGRESS: ReadingProgress = {
  bookId: 'bk-cs-04',
  bookTitle: 'Data Structures Using C',
  bookAuthor: 'Reema Thareja',
  chapter: 'Chapter 4: Trees & Binary Search Hierarchies',
  chapterIndex: 3,
  currentPage: 87,
  totalPages: 318,
  progressPercentage: 68,
  lastOpened: '2 hours ago',
  lastOpenedTimestamp: Date.now() - 2 * 60 * 60 * 1000,
  callNumber: 'QA76.73 .C15 D38 2023',
};

const INITIAL_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm-1',
    bookId: 'bk-cs-04',
    pageNumber: 87,
    chapterTitle: 'Chapter 4: Trees & Binary Search Hierarchies',
    snippet: 'Self-balancing AVL tree rotation invariants and height balance factor definitions.',
    createdAt: 'Yesterday',
  },
  {
    id: 'bm-2',
    bookId: 'bk-cs-04',
    pageNumber: 42,
    chapterTitle: 'Chapter 2: Stacks and Queue Models',
    snippet: 'Circular ring buffer pointer arithmetic implementation in C.',
    createdAt: '3 days ago',
  },
];

const INITIAL_NOTES: ReadingNote[] = [
  {
    id: 'note-1',
    bookId: 'bk-cs-04',
    pageNumber: 87,
    chapterTitle: 'Chapter 4: Trees & Binary Search Hierarchies',
    content: 'Review AVL left-right double rotations before Thursday midterm exam.',
    color: 'yellow',
    updatedAt: 'Yesterday at 16:40',
  },
  {
    id: 'note-2',
    bookId: 'bk-cs-04',
    pageNumber: 88,
    chapterTitle: 'Chapter 4: Trees & Binary Search Hierarchies',
    content: 'Ask Prof. Thorne about recursive vs iterative in-order traversal space complexity.',
    color: 'blue',
    updatedAt: '2 days ago',
  },
];

export const ReadingProgressService = {
  /**
   * Retrieve reading progress record for a specific book
   */
  async getProgress(bookId: string): Promise<ReadingProgress | null> {
    await new Promise((r) => setTimeout(r, 20));
    try {
      const records = this.getAllProgressRecords();
      return records[bookId] || (bookId === 'bk-cs-04' || bookId === 'data-structures-using-c' ? INITIAL_DEFAULT_PROGRESS : null);
    } catch {
      return null;
    }
  },

  /**
   * Save or update reading progress for a book
   */
  async saveProgress(progress: ReadingProgress): Promise<void> {
    try {
      const records = this.getAllProgressRecords();
      records[progress.bookId] = {
        ...progress,
        lastOpenedTimestamp: Date.now(),
        lastOpened: 'Just now',
      };
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(records));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kite_ils_reading_progress_updated', { detail: progress }));
      }
    } catch (e) {
      console.warn('Unable to persist reading progress locally', e);
    }
  },

  /**
   * Get all reading history records sorted by most recently opened
   */
  async getReadingHistory(): Promise<ReadingProgress[]> {
    await new Promise((r) => setTimeout(r, 20));
    try {
      const records = this.getAllProgressRecords();
      const list = Object.values(records);
      if (list.length === 0) {
        return [INITIAL_DEFAULT_PROGRESS];
      }
      return list.sort((a, b) => b.lastOpenedTimestamp - a.lastOpenedTimestamp);
    } catch {
      return [INITIAL_DEFAULT_PROGRESS];
    }
  },

  /**
   * Get the most recently read book for the Dashboard "Continue Reading" section
   */
  async getMostRecentBook(): Promise<ReadingProgress> {
    const history = await this.getReadingHistory();
    return history[0] || INITIAL_DEFAULT_PROGRESS;
  },

  /**
   * Internal helper to read progress records map from localStorage
   */
  getAllProgressRecords(): Record<string, ReadingProgress> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    return {
      'bk-cs-04': INITIAL_DEFAULT_PROGRESS,
    };
  },

  /**
   * Bookmarks management
   */
  async getBookmarks(bookId: string): Promise<Bookmark[]> {
    await new Promise((r) => setTimeout(r, 20));
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      const all: Bookmark[] = raw ? JSON.parse(raw) : INITIAL_BOOKMARKS;
      return all.filter((b) => b.bookId === bookId);
    } catch {
      return INITIAL_BOOKMARKS.filter((b) => b.bookId === bookId);
    }
  },

  async addBookmark(item: Omit<Bookmark, 'id' | 'createdAt'>): Promise<Bookmark> {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    const all: Bookmark[] = raw ? JSON.parse(raw) : INITIAL_BOOKMARKS;
    const newBm: Bookmark = {
      ...item,
      id: `bm-${Date.now()}`,
      createdAt: 'Just now',
    };
    const updated = [newBm, ...all.filter((b) => !(b.bookId === item.bookId && b.pageNumber === item.pageNumber))];
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(updated));
    return newBm;
  },

  async removeBookmark(bookId: string, pageNumber: number): Promise<void> {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    const all: Bookmark[] = raw ? JSON.parse(raw) : INITIAL_BOOKMARKS;
    const updated = all.filter((b) => !(b.bookId === bookId && b.pageNumber === pageNumber));
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(updated));
  },

  /**
   * Notes management
   */
  async getNotes(bookId: string): Promise<ReadingNote[]> {
    await new Promise((r) => setTimeout(r, 20));
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NOTES);
      const all: ReadingNote[] = raw ? JSON.parse(raw) : INITIAL_NOTES;
      return all.filter((n) => n.bookId === bookId);
    } catch {
      return INITIAL_NOTES.filter((n) => n.bookId === bookId);
    }
  },

  async addNote(item: Omit<ReadingNote, 'id' | 'updatedAt'>): Promise<ReadingNote> {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    const all: ReadingNote[] = raw ? JSON.parse(raw) : INITIAL_NOTES;
    const newNote: ReadingNote = {
      ...item,
      id: `note-${Date.now()}`,
      updatedAt: 'Just now',
    };
    const updated = [newNote, ...all];
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(updated));
    return newNote;
  },

  async deleteNote(noteId: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    const all: ReadingNote[] = raw ? JSON.parse(raw) : INITIAL_NOTES;
    const updated = all.filter((n) => n.id !== noteId);
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(updated));
  },

  /**
   * Reader visual appearance settings
   */
  getSettings(): ReaderSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // default
    }
    return {
      fontSize: 'md',
      fontFamily: 'serif',
      lineHeight: 'normal',
      theme: 'paper',
    };
  },

  saveSettings(settings: Partial<ReaderSettings>): ReaderSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },
};

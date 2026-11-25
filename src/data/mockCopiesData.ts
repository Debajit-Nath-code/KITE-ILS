/**
 * Kite ILS - Physical Book Copies Dataset & Inventory Storage
 * Centralized physical copy management with local persistence
 */
import { DetailedBookCopy, CopyStatus, Book } from '../types';
import { mockBooks } from './mockData';
import { getShelfIdForBook } from './wayfindingData';

const COPIES_STORAGE_KEY = 'kite_ils_admin_physical_copies';

/**
 * Generate initial realistic physical copies from existing mockBooks
 */
function generateInitialCopies(): DetailedBookCopy[] {
  const initialCopies: DetailedBookCopy[] = [];
  let accessionCounter = 10420;

  mockBooks.forEach((book, bookIdx) => {
    const total = book.totalCopies || 4;
    const available = book.availableCopies || 0;
    const shelf = book.location.shelf?.match(/(CS|PHY|MAT|ENG|BIO|LIT|ECO|CIV|REF|ARC)-[0-9]{3}/i)?.[0] || getShelfIdForBook(book);

    // Compute prefix from department / book ID
    const shortCode = book.id.replace('bk-', '').toUpperCase();

    for (let i = 1; i <= total; i++) {
      accessionCounter += 3;
      const copyNumStr = i.toString().padStart(2, '0');
      const copyId = `CP-${shortCode}-${copyNumStr}`;
      const accessionNumber = `ACC-2024-${accessionCounter}`;
      const barcode = `3198000${bookIdx.toString().padStart(2, '0')}${i.toString().padStart(2, '0')}`;

      // Determine status according to availableCopies
      let status: CopyStatus = 'Available';
      if (i > available) {
        if (i === available + 1) {
          status = 'Reserved';
        } else if (i === available + 2) {
          status = 'Borrowed';
        } else {
          status = 'Processing';
        }
      }

      initialCopies.push({
        copyId,
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        status,
        shelf,
        accessionNumber,
        barcode,
        department: book.department,
        condition: i === total ? 'Fair' : i === 1 ? 'Excellent' : 'Good',
        lastInspected: '2026-09-18',
        acquiredDate: '2024-08-15',
      });
    }
  });

  return initialCopies;
}

export class PhysicalCopiesService {
  private static getStoredCopies(): DetailedBookCopy[] {
    try {
      const data = localStorage.getItem(COPIES_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load copies from localStorage', e);
    }
    const initial = generateInitialCopies();
    try {
      localStorage.setItem(COPIES_STORAGE_KEY, JSON.stringify(initial));
    } catch {}
    return initial;
  }

  private static saveCopies(copies: DetailedBookCopy[]): void {
    try {
      localStorage.setItem(COPIES_STORAGE_KEY, JSON.stringify(copies));
    } catch (e) {
      console.warn('Failed to persist copies to localStorage', e);
    }
  }

  static getAllCopies(): DetailedBookCopy[] {
    return this.getStoredCopies();
  }

  static getCopiesForBook(bookId: string): DetailedBookCopy[] {
    const all = this.getStoredCopies();
    return all.filter((c) => c.bookId === bookId);
  }

  static updateCopyStatus(copyId: string, newStatus: CopyStatus): DetailedBookCopy | null {
    const copies = this.getStoredCopies();
    const idx = copies.findIndex((c) => c.copyId === copyId);
    if (idx === -1) return null;

    copies[idx] = {
      ...copies[idx],
      status: newStatus,
      lastInspected: new Date().toISOString().split('T')[0],
    };
    this.saveCopies(copies);
    return copies[idx];
  }

  static addCopy(copyData: Omit<DetailedBookCopy, 'copyId'> & { copyId?: string }): DetailedBookCopy {
    const copies = this.getStoredCopies();
    const bookCopies = copies.filter((c) => c.bookId === copyData.bookId);
    const copyIndex = bookCopies.length + 1;
    const shortCode = copyData.bookId.replace('bk-', '').toUpperCase();
    const copyId = copyData.copyId || `CP-${shortCode}-${copyIndex.toString().padStart(2, '0')}`;

    const newCopy: DetailedBookCopy = {
      ...copyData,
      copyId,
      acquiredDate: copyData.acquiredDate || new Date().toISOString().split('T')[0],
      lastInspected: copyData.lastInspected || new Date().toISOString().split('T')[0],
    };

    copies.push(newCopy);
    this.saveCopies(copies);
    return newCopy;
  }

  static deleteCopy(copyId: string): boolean {
    const copies = this.getStoredCopies();
    const filtered = copies.filter((c) => c.copyId !== copyId);
    if (filtered.length === copies.length) return false;
    this.saveCopies(filtered);
    return true;
  }
}

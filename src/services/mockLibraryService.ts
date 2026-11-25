/**
 * Kite ILS - Centralized Library Data Service
 * Centralized mock data service providing real-time search, multi-faceted filtering,
 * and sorting logic so it can be seamlessly replaced with an API without altering the UI.
 */
import { 
  Book, 
  Reservation, 
  ReservationStatus,
  LoanRecord, 
  AcquisitionRequest, 
  NotificationItem, 
  UserProfile,
  PhysicalBookCopy
} from '../types';
import { 
  mockBooks, 
  mockReservations, 
  mockLoans, 
  mockAcquisitions, 
  mockNotifications, 
  mockCurrentUser 
} from '../data/mockData';
import { PhysicalCopiesService } from '../data/mockCopiesData';

export type AvailabilityFilter = 'all' | 'available' | 'limited' | 'unavailable';
export type SortOption = 'relevance' | 'title' | 'recently_added' | 'availability';

export interface DiscoveryQueryOptions {
  query?: string;
  department?: string;
  category?: string;
  availability?: AvailabilityFilter;
  resourceType?: string;
  author?: string;
  digitalOnly?: boolean;
  sortBy?: SortOption;
}

export interface FacetCounts {
  departments: { name: string; count: number }[];
  categories: { name: string; count: number }[];
  resourceTypes: { name: string; count: number }[];
  availabilityCounts: {
    all: number;
    available: number;
    limited: number;
    unavailable: number;
  };
  authors: { name: string; count: number }[];
}

const BOOKS_STORAGE_KEY = 'kite_ils_books_v2';

function getStoredBooks(): Book[] {
  try {
    const raw = localStorage.getItem(BOOKS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...mockBooks];
}

function saveStoredBooks(books: Book[]): void {
  try {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
  } catch {}
}

export const LibraryService = {
  /**
   * Search, filter, and sort academic books with real-time matching
   */
  async getBooks(options: DiscoveryQueryOptions = {}): Promise<Book[]> {
    // Simulate brief responsive network cadence
    await new Promise((resolve) => setTimeout(resolve, 30));

    const {
      query = '',
      department = 'All',
      category = 'All',
      availability = 'all',
      resourceType = 'All',
      author = 'All',
      digitalOnly = false,
      sortBy = 'relevance',
    } = options;

    let results = getStoredBooks();

    // 1. Text Search across Title, Author, Subject, ISBN, and Description keywords
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter((b) => {
        const titleMatch = b.title.toLowerCase().includes(q) || (b.subtitle && b.subtitle.toLowerCase().includes(q));
        const authorMatch = b.author.toLowerCase().includes(q) || b.authors.some(a => a.toLowerCase().includes(q));
        const categoryMatch = b.category.toLowerCase().includes(q) || b.subjects.some(s => s.toLowerCase().includes(q));
        const isbnMatch = b.isbn.replace(/[-\s]/g, '').includes(q.replace(/[-\s]/g, ''));
        const descMatch = b.description.toLowerCase().includes(q) || b.abstract.toLowerCase().includes(q);
        const callMatch = b.location.callNumber.toLowerCase().includes(q);

        return titleMatch || authorMatch || categoryMatch || isbnMatch || descMatch || callMatch;
      });
    }

    // 2. Department Filter
    if (department && department !== 'All') {
      results = results.filter((b) => b.department === department);
    }

    // 3. Category / Subject Filter
    if (category && category !== 'All') {
      results = results.filter((b) => b.category === category || b.subjects.includes(category));
    }

    // 4. Availability Filter
    // 🟢 Available: 3+ copies
    // 🟡 Limited: 1 or 2 copies
    // 🔴 Unavailable: 0 copies
    if (availability && availability !== 'all') {
      if (availability === 'available') {
        results = results.filter((b) => b.availableCopies >= 3);
      } else if (availability === 'limited') {
        results = results.filter((b) => b.availableCopies === 1 || b.availableCopies === 2);
      } else if (availability === 'unavailable') {
        results = results.filter((b) => b.availableCopies === 0);
      }
    }

    // 5. Resource Type Filter
    if (resourceType && resourceType !== 'All') {
      results = results.filter((b) => b.resourceType === resourceType);
    }

    // 6. Author Facet Filter
    if (author && author !== 'All') {
      results = results.filter((b) => b.author === author || b.authors.includes(author));
    }

    // 7. Digital Only Filter
    if (digitalOnly) {
      results = results.filter((b) => b.digitalAvailable);
    }

    // 8. Sorting
    switch (sortBy) {
      case 'title':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;

      case 'recently_added':
        results.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;

      case 'availability':
        results.sort((a, b) => b.availableCopies - a.availableCopies);
        break;

      case 'relevance':
      default:
        if (query && query.trim()) {
          const q = query.toLowerCase().trim();
          results.sort((a, b) => {
            const aTitle = a.title.toLowerCase().includes(q) ? 10 : 0;
            const bTitle = b.title.toLowerCase().includes(q) ? 10 : 0;
            const aAuthor = a.author.toLowerCase().includes(q) ? 5 : 0;
            const bAuthor = b.author.toLowerCase().includes(q) ? 5 : 0;
            return (bTitle + bAuthor) - (aTitle + aAuthor);
          });
        }
        break;
    }

    return results;
  },

  /**
   * Return aggregated facet metadata from the collection
   */
  async getDiscoveryFacets(): Promise<FacetCounts> {
    const books = getStoredBooks();

    const deptMap: Record<string, number> = {};
    const catMap: Record<string, number> = {};
    const typeMap: Record<string, number> = {};
    const authorMap: Record<string, number> = {};

    let availCount = 0;
    let limitCount = 0;
    let unavailCount = 0;

    books.forEach((b) => {
      // Dept
      deptMap[b.department] = (deptMap[b.department] || 0) + 1;
      // Category
      catMap[b.category] = (catMap[b.category] || 0) + 1;
      // ResourceType
      typeMap[b.resourceType] = (typeMap[b.resourceType] || 0) + 1;
      // Primary Author
      authorMap[b.author] = (authorMap[b.author] || 0) + 1;

      // Availability status counts
      if (b.availableCopies >= 3) {
        availCount++;
      } else if (b.availableCopies === 1 || b.availableCopies === 2) {
        limitCount++;
      } else {
        unavailCount++;
      }
    });

    const toSortedArray = (map: Record<string, number>) =>
      Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    return {
      departments: toSortedArray(deptMap),
      categories: toSortedArray(catMap),
      resourceTypes: toSortedArray(typeMap),
      authors: toSortedArray(authorMap),
      availabilityCounts: {
        all: books.length,
        available: availCount,
        limited: limitCount,
        unavailable: unavailCount,
      },
    };
  },

  async getBookById(id: string): Promise<Book | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 30));
    const books = getStoredBooks();
    return books.find((b) => b.id === id);
  },

  /**
   * Find 4 related books based on category, subjects, or department
   */
  async getRelatedBooks(bookId: string, limit = 4): Promise<Book[]> {
    await new Promise((resolve) => setTimeout(resolve, 30));
    const books = getStoredBooks();
    const current = books.find((b) => b.id === bookId);
    if (!current) return books.slice(0, limit);

    return books
      .filter((b) => b.id !== bookId)
      .sort((a, b) => {
        let aScore = 0;
        let bScore = 0;

        if (a.category === current.category) aScore += 5;
        if (b.category === current.category) bScore += 5;

        if (a.department === current.department) aScore += 3;
        if (b.department === current.department) bScore += 3;

        const aCommonSubjects = a.subjects.filter((s) => current.subjects.includes(s)).length;
        const bCommonSubjects = b.subjects.filter((s) => current.subjects.includes(s)).length;

        aScore += aCommonSubjects * 2;
        bScore += bCommonSubjects * 2;

        return bScore - aScore;
      })
      .slice(0, limit);
  },

  /**
   * ADMIN BOOK MANAGEMENT METHODS
   */
  async addBook(bookData: Partial<Book>): Promise<Book> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const books = getStoredBooks();
    const nextNum = books.length + 1;
    const deptPrefix = (bookData.department || 'GEN').substring(0, 3).toLowerCase();
    const id = bookData.id || `bk-${deptPrefix}-${nextNum.toString().padStart(2, '0')}`;

    const newBook: Book = {
      id,
      title: bookData.title || 'Untitled Academic Monograph',
      subtitle: bookData.subtitle || '',
      author: bookData.author || 'Unknown Scholar',
      authors: bookData.authors || [bookData.author || 'Unknown Scholar'],
      publicationYear: bookData.publicationYear || new Date().getFullYear(),
      publisher: bookData.publisher || 'University Academic Press',
      edition: bookData.edition || '1st Edition',
      isbn: bookData.isbn || `978-019${Math.floor(1000000 + Math.random() * 9000000)}`,
      category: bookData.category || 'General Studies',
      department: bookData.department || 'Computer Science',
      description: bookData.description || 'Comprehensive academic volume cataloged in university collection.',
      abstract: bookData.abstract || bookData.description || 'Scholarly monograph on academic subject matter.',
      subjects: bookData.subjects || [bookData.category || 'Academic'],
      formats: bookData.formats || (bookData.digitalAvailable ? ['physical', 'ebook'] : ['physical']),
      cover: bookData.cover || 'from-slate-900 via-sky-950 to-slate-950',
      coverColor: bookData.coverColor || '#0f172a',
      location: bookData.location || {
        library: 'Central Library',
        building: 'Main University Library',
        floor: 'Floor 2',
        zone: 'Section C',
        aisle: 'Aisle 04',
        shelf: 'CS-204',
        callNumber: `QA76.${Math.floor(100 + Math.random() * 900)} .K${Math.floor(10 + Math.random() * 90)} 2026`,
        coordinates: { x: 310, y: 200 },
      },
      totalCopies: bookData.totalCopies ?? 3,
      availableCopies: bookData.availableCopies ?? 2,
      status: (bookData.availableCopies ?? 2) > 0 ? 'available_shelf' : 'checked_out',
      digitalAvailable: Boolean(bookData.digitalAvailable),
      digitalAccessUrl: bookData.digitalAccessUrl || '#',
      resourceType: bookData.resourceType || 'Book',
      dateAdded: new Date().toISOString().split('T')[0],
      rating: 4.8,
      reviewCount: 1,
    };

    books.unshift(newBook);
    saveStoredBooks(books);
    return newBook;
  },

  async updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const books = getStoredBooks();
    const idx = books.findIndex((b) => b.id === id);
    if (idx === -1) return null;

    const current = books[idx];
    const updated: Book = {
      ...current,
      ...updates,
      authors: updates.author ? [updates.author] : (updates.authors || current.authors),
      status: (updates.availableCopies ?? current.availableCopies) > 0 ? 'available_shelf' : 'checked_out',
    };

    books[idx] = updated;
    saveStoredBooks(books);
    return updated;
  },

  async deleteBook(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const books = getStoredBooks();
    const filtered = books.filter((b) => b.id !== id);
    if (filtered.length === books.length) return false;
    saveStoredBooks(filtered);
    return true;
  },

  async updateBookAvailability(id: string, availableCopies: number, totalCopies?: number): Promise<Book | null> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const books = getStoredBooks();
    const idx = books.findIndex((b) => b.id === id);
    if (idx === -1) return null;

    const current = books[idx];
    const newTotal = typeof totalCopies === 'number' ? totalCopies : current.totalCopies;
    const clampedAvail = Math.max(0, Math.min(newTotal, availableCopies));

    const updated: Book = {
      ...current,
      totalCopies: newTotal,
      availableCopies: clampedAvail,
      status: clampedAvail > 0 ? 'available_shelf' : 'checked_out',
    };

    books[idx] = updated;
    saveStoredBooks(books);
    return updated;
  },

  /**
   * Generate realistic individual physical copy statuses for a book
   */
  getBookCopies(book: Book): PhysicalBookCopy[] {
    const copies: PhysicalBookCopy[] = [];
    const total = book.totalCopies;
    const avail = book.availableCopies;

    for (let i = 1; i <= total; i++) {
      const copyNum = i.toString().padStart(2, '0');
      const copyId = `CPY-${book.id.replace('bk-', '').toUpperCase()}-${copyNum}`;
      const barcode = `31908${(100000 + i * 83).toString()}`;

      if (i <= avail) {
        copies.push({
          copyId,
          barcode,
          status: 'Available',
          location: `${book.location.library} · ${book.location.floor} · ${book.location.shelf}`,
          callNumber: `${book.location.callNumber} c.${i}`,
          condition: i === 1 ? 'Excellent' : 'Good',
        });
      } else if (i === avail + 1 && (total - avail) % 2 === 1) {
        copies.push({
          copyId,
          barcode,
          status: 'Reserved',
          location: 'Circulation Hold Shelf (Locker Routing)',
          callNumber: `${book.location.callNumber} c.${i}`,
          dueDate: 'Hold active (Expires in 48h)',
          condition: 'Excellent',
        });
      } else if (i === total && book.status === 'reference_only') {
        copies.push({
          copyId,
          barcode,
          status: 'Processing',
          location: 'Technical Services & Conservation Lab',
          callNumber: `${book.location.callNumber} c.${i}`,
          condition: 'Fair',
        });
      } else {
        copies.push({
          copyId,
          barcode,
          status: 'Borrowed',
          location: 'Checked out by patron',
          callNumber: `${book.location.callNumber} c.${i}`,
          dueDate: 'Due in 14 days (Oct 19, 2026)',
          condition: 'Good',
        });
      }
    }

    return copies;
  },

  async getReservations(): Promise<Reservation[]> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    try {
      const stored = localStorage.getItem('kite_ils_reservations_v2');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback to mock
    }
    return [...mockReservations];
  },

  async getReservationById(id: string): Promise<Reservation | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 30));
    const all = await this.getReservations();
    const idClean = id.toUpperCase().trim();
    return all.find(
      (r) =>
        r.id.toUpperCase() === idClean ||
        r.reservationId?.toUpperCase() === idClean ||
        r.claimToken?.toUpperCase() === idClean
    );
  },

  async createReservation(options: {
    bookId: string;
    pickupLocation: string;
    copyId?: string;
    duration?: string;
  }): Promise<Reservation> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const storedBooks = getStoredBooks();
    const targetIdx = storedBooks.findIndex((b) => b.id === options.bookId);
    const target = targetIdx !== -1 ? storedBooks[targetIdx] : mockBooks.find((b) => b.id === options.bookId);

    // Update book availability in storage
    if (targetIdx !== -1) {
      const book = storedBooks[targetIdx];
      const newAvail = Math.max(0, book.availableCopies - 1);
      storedBooks[targetIdx] = {
        ...book,
        availableCopies: newAvail,
        status: newAvail > 0 ? 'available_shelf' : 'checked_out',
      };
      saveStoredBooks(storedBooks);
    }

    // Update physical copy status in PhysicalCopiesService
    if (options.copyId) {
      PhysicalCopiesService.updateCopyStatus(options.copyId, 'Reserved');
    } else if (target) {
      const bookCopies = PhysicalCopiesService.getCopiesForBook(target.id);
      const availCopy = bookCopies.find((c) => c.status === 'Available');
      if (availCopy) {
        PhysicalCopiesService.updateCopyStatus(availCopy.copyId, 'Reserved');
      }
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
    const randomToken = Math.floor(1000 + Math.random() * 9000).toString();
    const resId = `KIT-${randomSuffix}`;
    const claimToken = `KITE-${randomToken}`;

    const now = new Date();
    const expires = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours

    const newRes: Reservation = {
      id: resId,
      reservationId: resId,
      claimToken: claimToken,
      bookId: options.bookId,
      bookTitle: target?.title || 'Unknown Title',
      bookAuthor: target?.author || 'Academic Faculty',
      bookAuthors: target?.authors || [target?.author || 'Unknown Author'],
      callNumber: target?.location.callNumber || 'GEN.000',
      library: target?.location.library || 'Central Library',
      pickupLocation: options.pickupLocation || 'Central Library · Smart Locker 14-B',
      pickupLocker: options.pickupLocation.includes('Locker')
        ? `Locker #${Math.floor(10 + Math.random() * 30)}B (Code: ${randomToken})`
        : undefined,
      shelf: target?.location.shelf || 'CS-204',
      copyId: options.copyId || `CPY-${options.bookId.replace('bk-', '').toUpperCase()}-01`,
      status: target && target.availableCopies > 0 ? 'ready_for_pickup' : 'active',
      reservedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      readyAt: now.toISOString(),
      reservationDuration: options.duration || '48 hours from dispatch',
    };

    try {
      const all = await this.getReservations();
      const updated = [newRes, ...all.filter((r) => r.id !== resId)];
      localStorage.setItem('kite_ils_reservations_v2', JSON.stringify(updated));
    } catch {
      // storage unavailable
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kite_ils_books_updated'));
      window.dispatchEvent(new CustomEvent('kite_ils_reservations_updated'));
    }

    return newRes;
  },

  async cancelReservation(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      const all = await this.getReservations();
      const targetRes = all.find((r) => r.id === id || r.reservationId === id);
      if (!targetRes) return false;

      const wasActive = targetRes.status !== 'cancelled' && targetRes.status !== 'completed';

      const updated = all.map((r) =>
        r.id === id || r.reservationId === id ? { ...r, status: 'cancelled' as const } : r
      );
      localStorage.setItem('kite_ils_reservations_v2', JSON.stringify(updated));

      if (wasActive && targetRes.bookId) {
        // Restore availability in stored books
        const storedBooks = getStoredBooks();
        const bIdx = storedBooks.findIndex((b) => b.id === targetRes.bookId);
        if (bIdx !== -1) {
          const book = storedBooks[bIdx];
          const newAvail = Math.min(book.totalCopies, book.availableCopies + 1);
          storedBooks[bIdx] = {
            ...book,
            availableCopies: newAvail,
            status: 'available_shelf',
          };
          saveStoredBooks(storedBooks);
        }

        // Restore copy status in PhysicalCopiesService
        if (targetRes.copyId) {
          PhysicalCopiesService.updateCopyStatus(targetRes.copyId, 'Available');
        } else {
          const bookCopies = PhysicalCopiesService.getCopiesForBook(targetRes.bookId);
          const resCopy = bookCopies.find((c) => c.status === 'Reserved');
          if (resCopy) {
            PhysicalCopiesService.updateCopyStatus(resCopy.copyId, 'Available');
          }
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kite_ils_books_updated'));
        window.dispatchEvent(new CustomEvent('kite_ils_reservations_updated'));
      }

      return true;
    } catch {
      return false;
    }
  },

  async updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      const all = await this.getReservations();
      const targetRes = all.find((r) => r.id === id || r.reservationId === id);
      if (!targetRes) return null;

      if (status === 'cancelled') {
        const success = await this.cancelReservation(id);
        return success ? { ...targetRes, status: 'cancelled' } : null;
      }

      let modified: Reservation | null = null;
      const updated = all.map((r) => {
        if (r.id === id || r.reservationId === id) {
          modified = { ...r, status };
          return modified;
        }
        return r;
      });
      localStorage.setItem('kite_ils_reservations_v2', JSON.stringify(updated));

      if (status === 'completed' && targetRes.copyId) {
        PhysicalCopiesService.updateCopyStatus(targetRes.copyId, 'Borrowed');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kite_ils_books_updated'));
        window.dispatchEvent(new CustomEvent('kite_ils_reservations_updated'));
      }

      return modified;
    } catch {
      return null;
    }
  },

  async reserveBook(bookId: string, pickupLocation: string): Promise<Reservation> {
    return this.createReservation({ bookId, pickupLocation });
  },

  async renewLoan(loanId: string): Promise<LoanRecord | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const loan = mockLoans.find((l) => l.id === loanId);
    if (!loan || loan.renewalsRemaining <= 0) return null;
    return {
      ...loan,
      renewalsRemaining: loan.renewalsRemaining - 1,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  },

  async getActiveLoans(): Promise<LoanRecord[]> {
    await new Promise((resolve) => setTimeout(resolve, 30));
    return [...mockLoans];
  },

  async getAcquisitions(): Promise<AcquisitionRequest[]> {
    await new Promise((resolve) => setTimeout(resolve, 30));
    try {
      const stored = localStorage.getItem('kite_ils_acquisitions_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [...mockAcquisitions];
  },

  async updateAcquisitionStatus(id: string, status: any): Promise<AcquisitionRequest | null> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const all = await this.getAcquisitions();
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], status };
    try {
      localStorage.setItem('kite_ils_acquisitions_v1', JSON.stringify(all));
    } catch {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kite_ils_acquisitions_updated'));
    }
    return all[idx];
  },

  async addAcquisitionRequest(data: Partial<AcquisitionRequest>): Promise<AcquisitionRequest> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const all = await this.getAcquisitions();
    const nextNum = Math.floor(10000 + Math.random() * 90000);
    const newReq: AcquisitionRequest = {
      id: `REQ-${nextNum}`,
      title: data.title || 'Untitled Academic Monograph',
      authors: data.authors || data.author || 'Unknown Scholar',
      author: data.author || data.authors || 'Unknown Scholar',
      isbn: data.isbn || '',
      publisher: data.publisher || 'University Academic Press',
      courseCode: data.courseCode || '',
      department: data.department || 'Computer Science',
      urgency: data.urgency || 'course_reserve',
      status: 'under_review',
      requestedBy: data.requestedBy || 'Alex Chen',
      requestedAt: new Date().toISOString().split('T')[0],
      notes: data.notes || '',
      reason: data.reason || data.notes || '',
    };

    const updated = [newReq, ...all];
    try {
      localStorage.setItem('kite_ils_acquisitions_v1', JSON.stringify(updated));
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kite_ils_acquisitions_updated'));
    }
    return newReq;
  },

  async getRecentActivities() {
    await new Promise((resolve) => setTimeout(resolve, 20));
    return [
      {
        id: 'act-adm-01',
        type: 'reservation',
        title: 'New Reservation Ready for Pickup',
        description: 'Operating System Concepts dispatched to Smart Locker 14-B (Claim Token: KITE-4821) for Alex Chen.',
        timestamp: '10 minutes ago',
        user: 'Alex Chen',
        category: 'Circulation',
        badge: 'Ready for Pickup',
        badgeColor: 'emerald',
      },
      {
        id: 'act-adm-02',
        type: 'acquisition',
        title: 'Acquisition Proposal Endorsed',
        description: 'Reinforcement Learning: An Introduction moved to ORDERED status by Collection Development.',
        timestamp: '45 minutes ago',
        user: 'Prof. Margaret Vance',
        category: 'Acquisitions',
        badge: 'Ordered',
        badgeColor: 'sky',
      },
      {
        id: 'act-adm-03',
        type: 'inventory',
        title: 'Physical Copy Returned & Shelved',
        description: 'Introduction to Algorithms copy CP-CS-02-03 returned at Central Chute and restored to Shelf CS-202.',
        timestamp: '2 hours ago',
        user: 'Central Circulation Chute',
        category: 'Stacks',
        badge: 'Available',
        badgeColor: 'emerald',
      },
      {
        id: 'act-adm-04',
        type: 'catalog',
        title: 'Catalog Metadata Calibrated',
        description: 'Call numbers and spatial wayfinding coordinates synced for Section C (Computer Science, Floor 2).',
        timestamp: '4 hours ago',
        user: 'Prof. Margaret Vance',
        category: 'Wayfinding',
        badge: 'Verified',
        badgeColor: 'slate',
      },
      {
        id: 'act-adm-05',
        type: 'loan',
        title: 'Academic Monograph Checked Out',
        description: 'The Art of Electronics (3rd Ed.) checked out to Devon Vance (KIT-2026-3021) for 30-day research loan.',
        timestamp: '6 hours ago',
        user: 'Devon Vance',
        category: 'Circulation',
        badge: 'Borrowed',
        badgeColor: 'amber',
      },
      {
        id: 'act-adm-06',
        type: 'acquisition',
        title: 'Faculty Monograph Request Submitted',
        description: 'Foundations of Modern Typography submitted by Prof. Julian Vance for course reserve.',
        timestamp: '1 day ago',
        user: 'Prof. Julian Vance',
        category: 'Acquisitions',
        badge: 'Under Review',
        badgeColor: 'amber',
      }
    ];
  },
};

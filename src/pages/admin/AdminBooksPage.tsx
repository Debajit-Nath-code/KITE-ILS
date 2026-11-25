import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Filter, 
  Laptop, 
  MapPin, 
  Building2, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { MonospaceCallout } from '../../components/ui/Typography';
import { useToast } from '../../components/ui/Toast';
import { LibraryService } from '../../services/mockLibraryService';
import { PhysicalCopiesService } from '../../data/mockCopiesData';
import { Book, DetailedBookCopy, CopyStatus } from '../../types';
import { getShelfIdForBook } from '../../data/wayfindingData';

export const AdminBooksPage: React.FC = () => {
  const { toast } = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [viewingCopiesBook, setViewingCopiesBook] = useState<Book | null>(null);
  const [bookCopiesList, setBookCopiesList] = useState<DetailedBookCopy[]>([]);
  const [updatingAvailabilityBook, setUpdatingAvailabilityBook] = useState<Book | null>(null);
  const [newAvailCopies, setNewAvailCopies] = useState<number>(0);
  const [newTotalCopies, setNewTotalCopies] = useState<number>(0);

  // Form state for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formIsbn, setFormIsbn] = useState('');
  const [formPublisher, setFormPublisher] = useState('');
  const [formYear, setFormYear] = useState<number>(2024);
  const [formDepartment, setFormDepartment] = useState('Computer Science');
  const [formCategory, setFormCategory] = useState('Distributed Systems');
  const [formShelf, setFormShelf] = useState('CS-204');
  const [formCallNumber, setFormCallNumber] = useState('QA76.76.O63 S558 2024');
  const [formTotalCopies, setFormTotalCopies] = useState<number>(5);
  const [formAvailableCopies, setFormAvailableCopies] = useState<number>(3);
  const [formDigitalAvailable, setFormDigitalAvailable] = useState<boolean>(true);
  const [formDescription, setFormDescription] = useState('');

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const data = await LibraryService.getBooks({});
      setBooks(data);
    } catch (e) {
      console.error(e);
      toast.error('Error', 'Unable to retrieve catalog monographs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchText =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.replace(/[-\s]/g, '').includes(q.replace(/[-\s]/g, '')) ||
        b.category.toLowerCase().includes(q) ||
        b.location.shelf.toLowerCase().includes(q);

      const matchDept = selectedDepartment === 'All' || b.department === selectedDepartment;

      let matchAvail = true;
      if (selectedAvailability === 'Available') {
        matchAvail = b.availableCopies > 0;
      } else if (selectedAvailability === 'Limited') {
        matchAvail = b.availableCopies === 1 || b.availableCopies === 2;
      } else if (selectedAvailability === 'Unavailable') {
        matchAvail = b.availableCopies === 0;
      }

      return matchText && matchDept && matchAvail;
    });
  }, [books, searchQuery, selectedDepartment, selectedAvailability]);

  // Departments list for filter
  const departments = useMemo(() => {
    const set = new Set(books.map((b) => b.department));
    return ['All', ...Array.from(set)];
  }, [books]);

  // Open Edit Modal
  const handleOpenEdit = (book: Book) => {
    setEditingBook(book);
    setFormTitle(book.title);
    setFormSubtitle(book.subtitle || '');
    setFormAuthor(book.author);
    setFormIsbn(book.isbn);
    setFormPublisher(book.publisher);
    setFormYear(book.publicationYear);
    setFormDepartment(book.department);
    setFormCategory(book.category);
    setFormShelf(book.location.shelf || 'CS-204');
    setFormCallNumber(book.location.callNumber || 'QA76.1 .C65');
    setFormTotalCopies(book.totalCopies);
    setFormAvailableCopies(book.availableCopies);
    setFormDigitalAvailable(book.digitalAvailable);
    setFormDescription(book.description);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingBook(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormAuthor('');
    setFormIsbn('978-');
    setFormPublisher('');
    setFormYear(2025);
    setFormDepartment('Computer Science');
    setFormCategory('Advanced Computing');
    setFormShelf('CS-204');
    setFormCallNumber('QA76.76 .K84 2025');
    setFormTotalCopies(5);
    setFormAvailableCopies(3);
    setFormDigitalAvailable(true);
    setFormDescription('');
    setIsAddModalOpen(true);
  };

  // Submit Add Book
  const handleSaveAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAuthor.trim()) {
      toast.error('Validation Error', 'Book title and author are required.');
      return;
    }

    try {
      const newBook = await LibraryService.addBook({
        title: formTitle.trim(),
        subtitle: formSubtitle.trim(),
        author: formAuthor.trim(),
        isbn: formIsbn.trim(),
        publisher: formPublisher.trim() || 'University Press',
        publicationYear: Number(formYear) || 2025,
        department: formDepartment,
        category: formCategory,
        totalCopies: Number(formTotalCopies) || 4,
        availableCopies: Number(formAvailableCopies) || 2,
        digitalAvailable: formDigitalAvailable,
        description: formDescription.trim() || 'Comprehensive academic research monograph.',
        location: {
          library: 'Central Library',
          building: 'Main University Library',
          floor: formShelf.startsWith('CS') || formShelf.startsWith('ENG') || formShelf.startsWith('LIT') ? 'Floor 2' : 'Floor 1',
          zone: formDepartment,
          aisle: 'Aisle 04',
          shelf: formShelf.toUpperCase().trim(),
          callNumber: formCallNumber.trim(),
          coordinates: { x: 310, y: 200 },
        },
      });

      // Also generate initial physical copies in PhysicalCopiesService
      for (let i = 1; i <= newBook.totalCopies; i++) {
        PhysicalCopiesService.addCopy({
          bookId: newBook.id,
          bookTitle: newBook.title,
          bookAuthor: newBook.author,
          status: i <= newBook.availableCopies ? 'Available' : 'Reserved',
          shelf: newBook.location.shelf,
          accessionNumber: `ACC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          barcode: `319800${Math.floor(100000 + Math.random() * 900000)}`,
          department: newBook.department,
          condition: 'Excellent',
        });
      }

      toast.success('Monograph Cataloged ✅', `"${newBook.title}" added to University collection.`);
      setIsAddModalOpen(false);
      loadBooks();
    } catch (e) {
      toast.error('Cataloging Error', 'Failed to add book.');
    }
  };

  // Submit Edit Book
  const handleSaveEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    try {
      const updated = await LibraryService.updateBook(editingBook.id, {
        title: formTitle.trim(),
        subtitle: formSubtitle.trim(),
        author: formAuthor.trim(),
        isbn: formIsbn.trim(),
        publisher: formPublisher.trim(),
        publicationYear: Number(formYear),
        department: formDepartment,
        category: formCategory,
        totalCopies: Number(formTotalCopies),
        availableCopies: Number(formAvailableCopies),
        digitalAvailable: formDigitalAvailable,
        description: formDescription.trim(),
        location: {
          ...editingBook.location,
          shelf: formShelf.toUpperCase().trim(),
          callNumber: formCallNumber.trim(),
        },
      });

      if (updated) {
        toast.success('Book Updated ✅', `Changes to "${updated.title}" saved.`);
        setEditingBook(null);
        loadBooks();
      }
    } catch (e) {
      toast.error('Update Failed', 'Unable to save book details.');
    }
  };

  // Confirm Delete Book
  const handleConfirmDelete = async () => {
    if (!deletingBook) return;
    try {
      const ok = await LibraryService.deleteBook(deletingBook.id);
      if (ok) {
        toast.info('Book Deleted', `"${deletingBook.title}" has been removed from catalog.`);
        setDeletingBook(null);
        loadBooks();
      }
    } catch (e) {
      toast.error('Deletion Error', 'Failed to remove book.');
    }
  };

  // View Copies for a Book
  const handleViewCopies = (book: Book) => {
    setViewingCopiesBook(book);
    const copies = PhysicalCopiesService.getCopiesForBook(book.id);
    setBookCopiesList(copies);
  };

  // Update Copy Status inside Copies View
  const handleUpdateCopyStatus = (copyId: string, status: CopyStatus) => {
    PhysicalCopiesService.updateCopyStatus(copyId, status);
    if (viewingCopiesBook) {
      const updatedCopies = PhysicalCopiesService.getCopiesForBook(viewingCopiesBook.id);
      setBookCopiesList(updatedCopies);
      const avail = updatedCopies.filter((c) => c.status === 'Available').length;
      LibraryService.updateBookAvailability(viewingCopiesBook.id, avail, updatedCopies.length);
      loadBooks();
      toast.success('Copy Status Updated', `Copy ${copyId} is now marked ${status}.`);
    }
  };

  // Open Quick Availability Modal
  const handleOpenUpdateAvailability = (book: Book) => {
    setUpdatingAvailabilityBook(book);
    setNewAvailCopies(book.availableCopies);
    setNewTotalCopies(book.totalCopies);
  };

  // Save Quick Availability
  const handleSaveAvailability = async () => {
    if (!updatingAvailabilityBook) return;
    try {
      const updated = await LibraryService.updateBookAvailability(
        updatingAvailabilityBook.id,
        newAvailCopies,
        newTotalCopies
      );
      if (updated) {
        toast.success(
          'Availability Calibrated',
          `"${updated.title}" now has ${updated.availableCopies} of ${updated.totalCopies} copies available.`
        );
        setUpdatingAvailabilityBook(null);
        loadBooks();
      }
    } catch (e) {
      toast.error('Error', 'Unable to adjust copies.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 select-none">
              Catalog Administration
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-xs text-slate-500">{books.length} Holdings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Book Holdings Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Curate academic titles, manage bibliographic records, adjust physical holdings availability, and audit copies.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add Monograph
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search query */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, author, ISBN, shelf (e.g. CS-204)..."
              className="w-full h-10 px-3 pl-9 bg-slate-50 text-xs sm:text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 text-xs sm:text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  Department: {d}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 text-xs sm:text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="All">All Availabilities</option>
              <option value="Available">Available (In Stacks)</option>
              <option value="Limited">Limited (1-2 Copies)</option>
              <option value="Unavailable">Unavailable (Zero Copies)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <strong>{filteredBooks.length}</strong> of {books.length} academic monographs</span>
          {(searchQuery || selectedDepartment !== 'All' || selectedAvailability !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedDepartment('All');
                setSelectedAvailability('All');
              }}
              className="text-sky-700 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Main Books Table */}
      <Card className="bg-white border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5">Title & Author</th>
                <th scope="col" className="px-4 py-3.5">Department / Category</th>
                <th scope="col" className="px-4 py-3.5">Shelf Location</th>
                <th scope="col" className="px-4 py-3.5">Physical Copies</th>
                <th scope="col" className="px-4 py-3.5">Digital</th>
                <th scope="col" className="px-4 py-3.5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No books found</p>
                    <p className="text-[11px] text-slate-400">Try modifying your search or filter terms.</p>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => {
                  const isAvailable = book.availableCopies > 0;
                  const isLimited = book.availableCopies === 1 || book.availableCopies === 2;

                  return (
                    <tr key={book.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Title & Author */}
                      <td className="px-4 py-3.5 text-slate-900">
                        <div className="max-w-md">
                          <Link to={`/book/${book.id}`} className="font-serif font-bold text-slate-900 hover:text-sky-700 transition-colors block text-sm leading-snug">
                            {book.title}
                          </Link>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            By {book.author} · <span className="font-mono">{book.publicationYear}</span> · {book.publisher}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                            ISBN: {book.isbn} · Call: {book.location.callNumber}
                          </div>
                        </div>
                      </td>

                      {/* 2. Department & Category */}
                      <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                        <span className="block font-medium">{book.department}</span>
                        <span className="text-[10px] text-slate-500 block">{book.category}</span>
                      </td>

                      {/* 3. Shelf Location */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="font-bold text-sky-950 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {book.location.shelf}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {book.location.library}
                        </span>
                      </td>

                      {/* 4. Physical Copies & Availability */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`
                              w-2 h-2 rounded-full shrink-0
                              ${
                                book.availableCopies >= 3
                                  ? 'bg-emerald-500 ring-2 ring-emerald-200'
                                  : isLimited
                                  ? 'bg-amber-500 ring-2 ring-amber-200'
                                  : 'bg-rose-500 ring-2 ring-rose-200'
                              }
                            `}
                          />
                          <span className="font-bold text-slate-900">
                            {book.availableCopies} / {book.totalCopies}
                          </span>
                          <span className="text-[10px] text-slate-500">avail</span>
                        </div>

                        {/* Quick Update Availability button */}
                        <button
                          type="button"
                          onClick={() => handleOpenUpdateAvailability(book)}
                          className="text-[10px] text-sky-700 hover:underline mt-1 block font-medium cursor-pointer"
                        >
                          Update Availability →
                        </button>
                      </td>

                      {/* 5. Digital Access */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {book.digitalAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            <Laptop className="w-3 h-3" />
                            <span>Digital Available</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Print Only</span>
                        )}
                      </td>

                      {/* 6. Admin Actions (View Copies, Edit, Delete) */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-[11px] h-7 px-2"
                          leftIcon={<Copy className="w-3 h-3 text-slate-600" />}
                          onClick={() => handleViewCopies(book)}
                          title="View Individual Physical Copies"
                        >
                          View Copies
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[11px] h-7 px-2"
                          leftIcon={<Edit3 className="w-3 h-3 text-slate-600" />}
                          onClick={() => handleOpenEdit(book)}
                          title="Edit Monograph Record"
                        >
                          Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[11px] h-7 px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          onClick={() => setDeletingBook(book)}
                          title="Delete Book"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ===================================================================== */}
      {/* MODAL 1: ADD BOOK                                                     */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Academic Monograph to Catalog"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAddBook} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Monograph Title *
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Concrete Mathematics: A Foundation for Computer Science"
                className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                placeholder="Optional secondary descriptive title"
                className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Lead Author / Scholar *
              </label>
              <input
                type="text"
                required
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                placeholder="e.g. Donald E. Knuth"
                className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                ISBN-13
              </label>
              <input
                type="text"
                value={formIsbn}
                onChange={(e) => setFormIsbn(e.target.value)}
                placeholder="978-0201558029"
                className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Department
              </label>
              <select
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="English">English</option>
                <option value="Economics">Economics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Discipline / Category
              </label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="e.g. Discrete Mathematics"
                className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Physical Shelf ID
              </label>
              <select
                value={formShelf}
                onChange={(e) => setFormShelf(e.target.value)}
                className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="CS-204">CS-204 (Operating Systems & Software)</option>
                <option value="CS-201">CS-201 (Foundations & Languages)</option>
                <option value="CS-202">CS-202 (Algorithms & Data Structures)</option>
                <option value="CS-203">CS-203 (Distributed & Databases)</option>
                <option value="ENG-201">ENG-201 (Electrical & Embedded)</option>
                <option value="ENG-202">ENG-202 (Mechanical & Structural)</option>
                <option value="LIT-201">LIT-201 (Humanities, Literature & Ethics)</option>
                <option value="PHY-101">PHY-101 (Classical Mechanics)</option>
                <option value="PHY-102">PHY-102 (Quantum & Theoretical)</option>
                <option value="MAT-101">MAT-101 (Pure Mathematics)</option>
                <option value="MAT-102">MAT-102 (Linear Algebra & Stats)</option>
                <option value="ECO-101">ECO-101 (Economics & Decision Science)</option>
                <option value="REF-101">REF-101 (Reference & Course Reserves)</option>
                <option value="BIO-101">BIO-101 (Biological Sciences)</option>
                <option value="BIO-102">BIO-102 (Environmental Sciences)</option>
                <option value="CIV-101">CIV-101 (Civil & Structural Engineering)</option>
                <option value="ARC-101">ARC-101 (Special Collections & Theses)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Call Number
              </label>
              <input
                type="text"
                value={formCallNumber}
                onChange={(e) => setFormCallNumber(e.target.value)}
                placeholder="QA39.2 .K68 2025"
                className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Total Physical Copies
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formTotalCopies}
                onChange={(e) => setFormTotalCopies(Number(e.target.value))}
                className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Initial Available Copies
              </label>
              <input
                type="number"
                min="0"
                max={formTotalCopies}
                value={formAvailableCopies}
                onChange={(e) => setFormAvailableCopies(Number(e.target.value))}
                className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
              <input
                type="checkbox"
                checked={formDigitalAvailable}
                onChange={(e) => setFormDigitalAvailable(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>Enable Authorized Digital Access (E-Reader Available)</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Description / Abstract
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Scholarly abstract or bibliographic description..."
              className="w-full px-3 py-2 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" leftIcon={<Plus className="w-4 h-4" />}>
              Save to Catalog
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 2: EDIT BOOK                                                    */}
      {/* ===================================================================== */}
      {editingBook && (
        <Modal
          isOpen={Boolean(editingBook)}
          onClose={() => setEditingBook(null)}
          title={`Edit Catalog Record: ${editingBook.title}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveEditBook} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Author *
                </label>
                <input
                  type="text"
                  required
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Publisher
                </label>
                <input
                  type="text"
                  value={formPublisher}
                  onChange={(e) => setFormPublisher(e.target.value)}
                  className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Shelf Location
                </label>
                <input
                  type="text"
                  value={formShelf}
                  onChange={(e) => setFormShelf(e.target.value)}
                  className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Call Number
                </label>
                <input
                  type="text"
                  value={formCallNumber}
                  onChange={(e) => setFormCallNumber(e.target.value)}
                  className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Total Copies
                </label>
                <input
                  type="number"
                  min="1"
                  value={formTotalCopies}
                  onChange={(e) => setFormTotalCopies(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Available Copies
                </label>
                <input
                  type="number"
                  min="0"
                  max={formTotalCopies}
                  value={formAvailableCopies}
                  onChange={(e) => setFormAvailableCopies(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={formDigitalAvailable}
                  onChange={(e) => setFormDigitalAvailable(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Digital E-Reader Edition Available</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingBook(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: VIEW COPIES                                                  */}
      {/* ===================================================================== */}
      {viewingCopiesBook && (
        <Modal
          isOpen={Boolean(viewingCopiesBook)}
          onClose={() => setViewingCopiesBook(null)}
          title={`Physical Copies: ${viewingCopiesBook.title}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="font-semibold text-slate-900 block">{viewingCopiesBook.title}</span>
                <span className="text-slate-500 font-mono">Shelf: {viewingCopiesBook.location.shelf} · Call: {viewingCopiesBook.location.callNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Inventory</span>
                <span className="font-bold text-slate-900">{bookCopiesList.length} physical copies</span>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {bookCopiesList.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No individual physical barcodes generated for this book yet.
                </div>
              ) : (
                bookCopiesList.map((copy) => (
                  <div
                    key={copy.copyId}
                    className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{copy.copyId}</span>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono text-slate-500 text-[11px]">{copy.accessionNumber}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Barcode: <strong className="font-mono text-slate-700">{copy.barcode}</strong> · Condition: {copy.condition || 'Good'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={copy.status}
                        onChange={(e) => handleUpdateCopyStatus(copy.copyId, e.target.value as CopyStatus)}
                        className={`
                          text-xs font-semibold px-2.5 py-1 rounded border focus:outline-none
                          ${
                            copy.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : copy.status === 'Reserved'
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : copy.status === 'Borrowed'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }
                        `}
                      >
                        <option value="Available">Available</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Borrowed">Borrowed</option>
                        <option value="Processing">Processing</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
              <span className="text-slate-500">
                Updating a copy's status automatically recalculates overall shelf availability.
              </span>
              <Button variant="outline" size="sm" onClick={() => setViewingCopiesBook(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: QUICK UPDATE AVAILABILITY                                    */}
      {/* ===================================================================== */}
      {updatingAvailabilityBook && (
        <Modal
          isOpen={Boolean(updatingAvailabilityBook)}
          onClose={() => setUpdatingAvailabilityBook(null)}
          title="Adjust Shelf Availability"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-serif font-bold text-slate-900 truncate">
                {updatingAvailabilityBook.title}
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                Shelf {updatingAvailabilityBook.location.shelf}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Available Copies on Shelf
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-9 h-9 p-0 text-base"
                    onClick={() => setNewAvailCopies((prev) => Math.max(0, prev - 1))}
                    disabled={newAvailCopies <= 0}
                  >
                    -
                  </Button>
                  <span className="font-mono text-xl font-bold w-12 text-center text-slate-900">
                    {newAvailCopies}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-9 h-9 p-0 text-base"
                    onClick={() => setNewAvailCopies((prev) => Math.min(newTotalCopies, prev + 1))}
                    disabled={newAvailCopies >= newTotalCopies}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Total Collection Holdings
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newTotalCopies}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setNewTotalCopies(val);
                    if (newAvailCopies > val) setNewAvailCopies(val);
                  }}
                  className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setUpdatingAvailabilityBook(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveAvailability}>
                Save Availability
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: CONFIRM DELETE                                               */}
      {/* ===================================================================== */}
      {deletingBook && (
        <Modal
          isOpen={Boolean(deletingBook)}
          onClose={() => setDeletingBook(null)}
          title="Remove Monograph from Catalog"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-slate-600">
              Are you sure you want to delete <strong>"{deletingBook.title}"</strong> ({deletingBook.author}) from the University catalog?
            </p>
            <p className="text-[11px] text-rose-600 font-semibold bg-rose-50 p-2.5 rounded border border-rose-200">
              Warning: This will remove all associated physical copy accession numbers and active catalog indexes.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setDeletingBook(null)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleConfirmDelete}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

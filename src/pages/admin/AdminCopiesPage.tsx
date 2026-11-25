import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Copy, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  QrCode, 
  Plus, 
  Layers, 
  MapPin, 
  Building2, 
  ArrowLeftRight, 
  CalendarCheck, 
  SlidersHorizontal,
  RefreshCw,
  Printer,
  ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { MonospaceCallout } from '../../components/ui/Typography';
import { useToast } from '../../components/ui/Toast';
import { PhysicalCopiesService } from '../../data/mockCopiesData';
import { LibraryService } from '../../services/mockLibraryService';
import { DetailedBookCopy, CopyStatus, Book } from '../../types';

export const AdminCopiesPage: React.FC = () => {
  const { toast } = useToast();

  const [copies, setCopies] = useState<DetailedBookCopy[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedShelf, setSelectedShelf] = useState<string>('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBarcodeCopy, setSelectedBarcodeCopy] = useState<DetailedBookCopy | null>(null);

  // New Copy Form
  const [newBookId, setNewBookId] = useState('');
  const [newStatus, setNewStatus] = useState<CopyStatus>('Available');
  const [newShelf, setNewShelf] = useState('CS-204');
  const [newCondition, setNewCondition] = useState<'Excellent' | 'Good' | 'Fair'>('Excellent');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allCopies = PhysicalCopiesService.getAllCopies();
      const allBooks = await LibraryService.getBooks({});
      setCopies(allCopies);
      setBooks(allBooks);
      if (allBooks.length > 0 && !newBookId) {
        setNewBookId(allBooks[0].id);
        setNewShelf(allBooks[0].location.shelf || 'CS-204');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error', 'Unable to load copy inventory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered physical copies
  const filteredCopies = useMemo(() => {
    return copies.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.copyId.toLowerCase().includes(q) ||
        c.bookTitle.toLowerCase().includes(q) ||
        c.accessionNumber.toLowerCase().includes(q) ||
        c.barcode.includes(q) ||
        c.shelf.toLowerCase().includes(q);

      const matchStatus = selectedStatus === 'All' || c.status === selectedStatus;
      const matchShelf = selectedShelf === 'All' || c.shelf === selectedShelf;

      return matchSearch && matchStatus && matchShelf;
    });
  }, [copies, searchQuery, selectedStatus, selectedShelf]);

  // Unique shelves for filter
  const shelves = useMemo(() => {
    const set = new Set(copies.map((c) => c.shelf));
    return ['All', ...Array.from(set).sort()];
  }, [copies]);

  // Status metrics
  const totalCount = copies.length;
  const availableCount = copies.filter((c) => c.status === 'Available').length;
  const borrowedCount = copies.filter((c) => c.status === 'Borrowed').length;
  const reservedCount = copies.filter((c) => c.status === 'Reserved').length;
  const processingCount = copies.filter((c) => c.status === 'Processing').length;

  // Handle status update
  const handleStatusChange = (copyId: string, status: CopyStatus) => {
    const updated = PhysicalCopiesService.updateCopyStatus(copyId, status);
    if (updated) {
      setCopies(PhysicalCopiesService.getAllCopies());
      toast.success('Copy Status Updated', `Item ${copyId} is now marked as ${status}.`);
    }
  };

  // Handle Add New Copy
  const handleSaveAddCopy = (e: React.FormEvent) => {
    e.preventDefault();
    const book = books.find((b) => b.id === newBookId);
    if (!book) return;

    const copy = PhysicalCopiesService.addCopy({
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      status: newStatus,
      shelf: newShelf || book.location.shelf || 'CS-204',
      accessionNumber: `ACC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      barcode: `319800${Math.floor(100000 + Math.random() * 900000)}`,
      department: book.department,
      condition: newCondition,
    });

    toast.success('Physical Copy Registered', `Copy ID: ${copy.copyId} added to shelf ${copy.shelf}.`);
    setIsAddModalOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 select-none">
              Physical Inventory Management
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-xs text-slate-500">{totalCount} Barcoded Units</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Book Copy Inventory & Accession Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track exact item-level status, shelf locations, accession tags, and barcode routing for physical stacks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadData}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Register Copy
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Total Inventory</span>
          <span className="text-2xl font-serif font-bold text-slate-900 block mt-1">{totalCount}</span>
          <span className="text-[10px] text-slate-500">Physical barcodes</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-emerald-700 block font-semibold">Available on Shelf</span>
          <span className="text-2xl font-serif font-bold text-emerald-700 block mt-1">{availableCount}</span>
          <span className="text-[10px] text-emerald-600">Ready for pickup/loan</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-sky-700 block font-semibold">Reserved (Hold)</span>
          <span className="text-2xl font-serif font-bold text-sky-800 block mt-1">{reservedCount}</span>
          <span className="text-[10px] text-sky-600">Locker / dispatch</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-amber-700 block font-semibold">Borrowed (On Loan)</span>
          <span className="text-2xl font-serif font-bold text-slate-900 block mt-1">{borrowedCount}</span>
          <span className="text-[10px] text-amber-700">With patrons</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">Processing / Bindery</span>
          <span className="text-2xl font-serif font-bold text-slate-600 block mt-1">{processingCount}</span>
          <span className="text-[10px] text-slate-500">Repair & cataloging</span>
        </div>
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
              placeholder="Search Copy ID (CP-CS-04-01), Book Title, Accession (ACC-2024...), Barcode..."
              className="w-full h-10 px-3 pl-9 bg-slate-50 text-xs sm:text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 text-xs sm:text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Borrowed">Borrowed</option>
              <option value="Processing">Processing</option>
            </select>
          </div>

          {/* Shelf Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedShelf}
              onChange={(e) => setSelectedShelf(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 text-xs sm:text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              {shelves.map((s) => (
                <option key={s} value={s}>
                  Shelf: {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <strong>{filteredCopies.length}</strong> of {totalCount} physical units</span>
          {(searchQuery || selectedStatus !== 'All' || selectedShelf !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('All');
                setSelectedShelf('All');
              }}
              className="text-sky-700 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Main Copy Inventory Table */}
      {/* Required columns: Copy ID | Book | Status | Shelf | Accession number */}
      <Card className="bg-white border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5">Copy ID</th>
                <th scope="col" className="px-4 py-3.5">Book Monograph</th>
                <th scope="col" className="px-4 py-3.5">Status</th>
                <th scope="col" className="px-4 py-3.5">Shelf Location</th>
                <th scope="col" className="px-4 py-3.5">Accession Number</th>
                <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCopies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <Copy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No physical copies matched</p>
                    <p className="text-[11px] text-slate-400">Try adjusting your shelf, status, or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredCopies.map((copy) => {
                  return (
                    <tr key={copy.copyId} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Copy ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-sky-950 bg-sky-50 px-2 py-1 rounded border border-sky-300 block w-fit">
                          {copy.copyId}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 block mt-1">
                          Barcode: {copy.barcode}
                        </span>
                      </td>

                      {/* 2. Book */}
                      <td className="px-4 py-3.5 text-slate-900">
                        <div className="max-w-xs sm:max-w-sm">
                          <Link
                            to={`/book/${copy.bookId}`}
                            className="font-serif font-bold text-slate-900 hover:text-sky-700 transition-colors block text-sm leading-snug truncate"
                            title={copy.bookTitle}
                          >
                            {copy.bookTitle}
                          </Link>
                          <span className="text-[11px] text-slate-500 block truncate">
                            By {copy.bookAuthor} · {copy.department}
                          </span>
                        </div>
                      </td>

                      {/* 3. Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <select
                          value={copy.status}
                          onChange={(e) => handleStatusChange(copy.copyId, e.target.value as CopyStatus)}
                          className={`
                            text-xs font-semibold px-2.5 py-1 rounded-md border focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer
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
                      </td>

                      {/* 4. Shelf */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Link
                          to={`/navigate/${copy.shelf}`}
                          className="font-mono font-bold text-xs text-slate-800 hover:text-sky-700 flex items-center gap-1 group"
                          title="Navigate to this shelf on floor map"
                        >
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 group-hover:border-sky-400">
                            {copy.shelf}
                          </span>
                        </Link>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {copy.shelf.startsWith('CS') || copy.shelf.startsWith('ENG') || copy.shelf.startsWith('LIT') ? 'Floor 2' : 'Floor 1'}
                        </span>
                      </td>

                      {/* 5. Accession Number */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-medium text-slate-700">
                          {copy.accessionNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Condition: {copy.condition || 'Good'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[11px] h-7 px-2 text-slate-600 hover:text-slate-900"
                          leftIcon={<QrCode className="w-3.5 h-3.5 text-slate-500" />}
                          onClick={() => setSelectedBarcodeCopy(copy)}
                        >
                          Barcode Slip
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
      {/* MODAL 1: REGISTER PHYSICAL COPY                                       */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Physical Copy into Stacks"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAddCopy} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Select Monograph Title *
            </label>
            <select
              value={newBookId}
              onChange={(e) => {
                setNewBookId(e.target.value);
                const b = books.find((x) => x.id === e.target.value);
                if (b && b.location.shelf) setNewShelf(b.location.shelf);
              }}
              className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.author})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Target Shelf Code
              </label>
              <input
                type="text"
                value={newShelf}
                onChange={(e) => setNewShelf(e.target.value)}
                placeholder="e.g. CS-204"
                className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Physical Condition
              </label>
              <select
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value as any)}
                className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="Excellent">Excellent (New accession)</option>
                <option value="Good">Good (Circulated)</option>
                <option value="Fair">Fair (Needs bindery inspection)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Initial Stacks Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as CopyStatus)}
              className="w-full h-9 px-3 bg-white text-xs border border-slate-300 rounded-lg text-slate-900"
            >
              <option value="Available">Available (Placed on shelf)</option>
              <option value="Processing">Processing (Under cataloging)</option>
              <option value="Reserved">Reserved (Pre-hold)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-xs">
            <span className="font-semibold block text-slate-800 mb-0.5">Automated Assignment:</span>
            A unique <strong>Accession Number</strong> and <strong>Circulation Barcode</strong> will be sequentially generated upon registration.
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" leftIcon={<Plus className="w-4 h-4" />}>
              Register Physical Item
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 2: PRINT BARCODE SLIP PREVIEW                                   */}
      {/* ===================================================================== */}
      {selectedBarcodeCopy && (
        <Modal
          isOpen={Boolean(selectedBarcodeCopy)}
          onClose={() => setSelectedBarcodeCopy(null)}
          title="Physical Item Spine & Accession Slip"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            {/* Printable Spine Label */}
            <div className="p-5 bg-white border-2 border-dashed border-slate-300 rounded-xl space-y-3 font-mono text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                KITE UNIVERSITY CENTRAL LIBRARY
              </div>

              <div className="py-2 border-y border-slate-200 space-y-1">
                <span className="text-xl font-bold text-slate-900 block">{selectedBarcodeCopy.copyId}</span>
                <span className="text-xs font-semibold text-slate-600 block">{selectedBarcodeCopy.accessionNumber}</span>
              </div>

              <div className="font-sans text-left space-y-1 text-xs">
                <p className="font-serif font-bold text-slate-900 line-clamp-2">{selectedBarcodeCopy.bookTitle}</p>
                <p className="text-[11px] text-slate-500">By {selectedBarcodeCopy.bookAuthor}</p>
              </div>

              {/* Simulated Barcode */}
              <div className="pt-2">
                <div className="h-10 w-full flex items-center justify-center gap-0.5 bg-slate-100 p-1 rounded">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-full bg-slate-900"
                      style={{
                        width: (i % 3 === 0 ? '3px' : i % 2 === 0 ? '1px' : '2px'),
                        marginRight: (i % 4 === 0 ? '2px' : '1px'),
                      }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] text-slate-500 block mt-1">*{selectedBarcodeCopy.barcode}*</span>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                <span>Shelf: <strong className="text-slate-800">{selectedBarcodeCopy.shelf}</strong></span>
                <span>Status: <strong className="text-slate-800">{selectedBarcodeCopy.status}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => {
                  toast.success('Spine Slip Sent to Printer', `Dispatched barcode ${selectedBarcodeCopy.barcode} to circulation desk printer.`);
                  setSelectedBarcodeCopy(null);
                }}
              >
                Print Spine Label
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedBarcodeCopy(null)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

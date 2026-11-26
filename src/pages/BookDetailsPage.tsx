import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageContainer } from '../layouts/PageContainer';
import { 
  PageHeading, 
  SectionHeading, 
  Subheading, 
  MonospaceCallout, 
  Kicker,
  Text 
} from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ReservationModal } from '../components/reservation/ReservationModal';
import { EmptyState } from '../components/ui/EmptyState';
import { BookCardSkeleton } from '../components/ui/LoadingState';
import { useToast } from '../components/ui/Toast';
import { 
  LibraryService 
} from '../services/mockLibraryService';
import { getShelfIdForBook } from '../data/wayfindingData';
import { Book, PhysicalBookCopy } from '../types';
import { 
  ArrowLeft, 
  BookMarked, 
  Compass, 
  Laptop, 
  MapPin, 
  Building2, 
  Calendar, 
  Hash, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Bookmark, 
  ExternalLink,
  BookOpen,
  ShieldCheck,
  Tag,
  Key
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Visual Availability Badge (🟢 🟡 🔴)                                      */
/* -------------------------------------------------------------------------- */

const StrongAvailabilityBanner: React.FC<{
  availableCopies: number;
  totalCopies: number;
}> = ({ availableCopies, totalCopies }) => {
  if (availableCopies >= 3) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300/80 shadow-2xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            Available on Shelf
          </span>
        </div>
        <p className="text-xl sm:text-2xl font-serif font-medium text-emerald-950 mt-1">
          {availableCopies} of {totalCopies} copies available
        </p>
        <p className="text-[11px] text-emerald-800">
          Immediate walk-in retrieval or 1-hour automated locker dispatch.
        </p>
      </div>
    );
  }

  if (availableCopies >= 1) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-300/80 shadow-2xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Limited Availability
          </span>
        </div>
        <p className="text-xl sm:text-2xl font-serif font-medium text-amber-950 mt-1">
          {availableCopies} of {totalCopies} copy available
        </p>
        <p className="text-[11px] text-amber-800">
          High patron demand. Reserving a physical copy is recommended.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-rose-50 border border-rose-300/80 shadow-2xs space-y-1">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100 shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wider text-rose-900">
          Currently Unavailable
        </span>
      </div>
      <p className="text-xl sm:text-2xl font-serif font-medium text-rose-950 mt-1">
        0 of {totalCopies} copies available
      </p>
      <p className="text-[11px] text-rose-800">
        All copies currently loaned or on hold. Join the reservation queue.
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Copy Status Badge                                                         */
/* -------------------------------------------------------------------------- */

const CopyStatusBadge: React.FC<{ status: PhysicalBookCopy['status'] }> = ({ status }) => {
  const config = {
    Available: {
      dot: 'bg-emerald-500 ring-emerald-200',
      text: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
    Reserved: {
      dot: 'bg-sky-500 ring-sky-200',
      text: 'text-sky-800 bg-sky-50 border-sky-200',
      icon: <Clock className="w-3.5 h-3.5 text-sky-600" />,
    },
    Borrowed: {
      dot: 'bg-slate-400 ring-slate-200',
      text: 'text-slate-700 bg-slate-100 border-slate-200',
      icon: <BookMarked className="w-3.5 h-3.5 text-slate-500" />,
    },
    Processing: {
      dot: 'bg-purple-500 ring-purple-200',
      text: 'text-purple-800 bg-purple-50 border-purple-200',
      icon: <AlertCircle className="w-3.5 h-3.5 text-purple-600" />,
    },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.text}`}>
      {config.icon}
      <span>{status}</span>
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Book Details Page Component                                                */
/* -------------------------------------------------------------------------- */

export const BookDetailsPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [copies, setCopies] = useState<PhysicalBookCopy[]>([]);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Expandable Copy Breakdown
  const [isCopiesExpanded, setIsCopiesExpanded] = useState(true);

  // Modals
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('Science Library · Smart Locker 14-B');
  const [isReserving, setIsReserving] = useState(false);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);

    const loadBookData = () => {
      if (bookId) {
        LibraryService.getBookById(bookId).then((found) => {
          if (!isCurrent) return;
          if (found) {
            setBook(found);
            setCopies(LibraryService.getBookCopies(found));
            LibraryService.getRelatedBooks(found.id, 4).then((rel) => {
              if (isCurrent) setRelatedBooks(rel);
            });
          } else {
            setBook(null);
          }
          setLoading(false);
        });
      }
    };

    loadBookData();

    const handleUpdate = () => {
      loadBookData();
    };

    window.addEventListener('kite_ils_books_updated', handleUpdate);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isCurrent = false;
      window.removeEventListener('kite_ils_books_updated', handleUpdate);
    };
  }, [bookId]);

  const handleConfirmReservation = async () => {
    if (!book) return;
    setIsReserving(true);
    try {
      await LibraryService.reserveBook(book.id, pickupLocation);
      setIsReserving(false);
      setIsReserveModalOpen(false);
      toast.success(
        book.availableCopies > 0 ? 'Physical Hold Confirmed' : 'Added to Hold Waitlist',
        book.availableCopies > 0
          ? `"${book.title}" will be routed to ${pickupLocation}. Locker passcode will be sent upon loading.`
          : `You are in queue position #1 for "${book.title}". Estimated availability: 3–5 business days.`
      );
    } catch {
      setIsReserving(false);
      toast.error('Reservation Error', 'Unable to reach the automated locker service.');
    }
  };

  if (loading) {
    return (
      <PageContainer maxWidth="standard" className="py-10">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Loading catalog record...</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <div className="w-full aspect-3/4 bg-slate-200 rounded-xl animate-pulse" />
          </div>
          <div className="lg:col-span-6 space-y-4">
            <div className="h-8 bg-slate-200 rounded w-4/5 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
            <div className="h-24 bg-slate-100 rounded w-full animate-pulse mt-4" />
          </div>
          <div className="lg:col-span-3">
            <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!book) {
    return (
      <PageContainer maxWidth="standard" className="py-12">
        <EmptyState
          title="Monograph Record Not Found"
          description={`The catalog accession identifier "${bookId}" could not be located in university collections.`}
          actionLabel="Return to Discovery Catalog"
          onAction={() => navigate('/discover')}
        />
      </PageContainer>
    );
  }

  const isAvailable = book.availableCopies > 0;

  return (
    <div className="flex-1 bg-slate-50 pb-16">
      {/* Top Breadcrumb Bar */}
      <section className="bg-white border-b border-slate-200/80 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2 text-xs">
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 min-h-[36px] md:min-h-0 font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Back to Discovery Catalog</span>
          </Link>

          <div className="flex items-center gap-3 text-slate-500">
            <span className="hidden sm:inline">Faculty: {book.department}</span>
            <span className="hidden sm:inline">·</span>
            <MonospaceCallout>{book.location.callNumber}</MonospaceCallout>
          </div>
        </div>
      </section>

      {/* Main 3-Column Resource Workspace */}
      <PageContainer maxWidth="standard" className="pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================================================================ */}
          {/* LEFT COLUMN: Visual Book Cover & Quick Classification Indicators */}
          {/* ================================================================ */}
          <div className="lg:col-span-3 space-y-4">
            {/* High-Fidelity Academic Book Jacket */}
            <div
              className={`
                relative w-full aspect-3/4 rounded-xl overflow-hidden shadow-md 
                border border-white/10 p-5 flex flex-col justify-between text-white select-none
                bg-gradient-to-br ${book.cover || 'from-slate-900 via-sky-950 to-slate-900'}
              `}
              style={{
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25), 0 8px 10px -6px rgba(15, 23, 42, 0.2)',
              }}
            >
              {/* Embossed Spine Gutter Shadow */}
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none" />

              {/* Department & Format Kicker */}
              <div className="relative z-10 space-y-0.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-sky-200 block truncate">
                  {book.department}
                </span>
                <span className="text-[11px] font-medium text-slate-300 block truncate">
                  {book.resourceType}
                </span>
              </div>

              {/* Monograph Title in Editorial Newsreader Serif */}
              <div className="relative z-10 my-auto py-2">
                <h2 className="font-serif text-xl sm:text-2xl font-semibold leading-tight text-white drop-shadow-xs">
                  {book.title}
                </h2>
                {book.subtitle && (
                  <p className="text-xs text-slate-200 mt-1 line-clamp-2 leading-relaxed">
                    {book.subtitle}
                  </p>
                )}
                <div className="mt-3 text-xs text-sky-200 font-medium">
                  {book.author}
                </div>
              </div>

              {/* Footer Publisher & Call Number Plate */}
              <div className="relative z-10 pt-2 border-t border-white/20 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-300 truncate">{book.publisher}</span>
                <span className="text-sky-300 font-semibold">{book.publicationYear}</span>
              </div>
            </div>

            {/* Quick Accession & Physical Metrics Card */}
            <Card className="p-4 bg-white text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                  Catalog Status
                </span>
                <span className="font-mono text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  RFID Verified
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Holdings:</span>
                <span className="font-semibold text-slate-900">{book.totalCopies} physical copies</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Digital Format:</span>
                <span className="font-medium text-slate-900">
                  {book.digitalAvailable ? 'Synchronized e-Book' : 'Print Only'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Catalog Accession:</span>
                <span className="font-mono text-slate-500">ACC-{book.id.toUpperCase()}</span>
              </div>
            </Card>
          </div>

          {/* ================================================================ */}
          {/* CENTER COLUMN: Full Metadata, Description & Individual Copies    */}
          {/* ================================================================ */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title & Primary Attribution */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                  {book.department}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">{book.category}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-xs text-slate-400">{book.resourceType}</span>
              </div>

              <PageHeading className="text-2xl sm:text-3xl lg:text-4xl">
                {book.title}
              </PageHeading>

              {book.subtitle && (
                <p className="text-sm sm:text-base text-slate-500 mt-1 font-serif leading-relaxed">
                  {book.subtitle}
                </p>
              )}

              {/* Authors Row */}
              <div className="mt-3 flex items-center flex-wrap gap-2 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">
                  {book.author}
                </span>
                {book.authors.length > 1 && (
                  <span className="text-slate-500 text-xs">
                    with {book.authors.slice(1).join(', ')}
                  </span>
                )}
              </div>
            </div>

            {/* Structured Bibliographic Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">
                  Standard ISBN
                </span>
                <span className="font-mono text-slate-900 font-medium select-all block mt-0.5 truncate">
                  {book.isbn}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">
                  Publisher
                </span>
                <span className="font-medium text-slate-900 block mt-0.5 truncate">
                  {book.publisher}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">
                  Publication Year
                </span>
                <span className="font-medium text-slate-900 block mt-0.5">
                  {book.publicationYear} ({book.edition || 'Standard Ed.'})
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">
                  LC Call Number
                </span>
                <span className="font-mono text-sky-800 font-semibold select-all block mt-0.5 truncate">
                  {book.location.callNumber}
                </span>
              </div>
            </div>

            {/* Academic Description & Abstract */}
            <Card className="p-6 bg-white space-y-4">
              <div>
                <h3 className="font-serif text-base font-semibold text-slate-900 mb-2">
                  Academic Description & Scope
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {book.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Curatorial Abstract
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-serif italic">
                  "{book.abstract}"
                </p>
              </div>

              {/* Subject Headings */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Library Subject Headings:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {book.subjects.map((sub) => (
                    <span
                      key={sub}
                      className="px-2.5 py-1 text-xs text-slate-600 bg-slate-100 rounded-md border border-slate-200/60"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* BOOK COPY INFORMATION (Expandable Table) */}
            <Card className="bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setIsCopiesExpanded((prev) => !prev)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-base font-semibold text-slate-900">
                      Physical Copy Inventory ({copies.length} Copies)
                    </h3>
                    <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {book.availableCopies} on shelf
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Individual volume barcode tracking, branch location, and loan status.
                  </p>
                </div>
                <div className="p-1 rounded-md text-slate-400">
                  {isCopiesExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isCopiesExpanded && (
                <div className="border-t border-slate-100 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200/80">
                      <tr>
                        <th className="py-3 px-4">Copy ID & Barcode</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Shelving Location</th>
                        <th className="py-3 px-4">Condition / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {copies.map((copy) => (
                        <tr key={copy.copyId} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-semibold text-slate-900 block">{copy.copyId}</span>
                            <span className="text-[11px] text-slate-400">RFID: {copy.barcode}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <CopyStatusBadge status={copy.status} />
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <span>{copy.location}</span>
                            <span className="block font-mono text-[11px] text-slate-400 mt-0.5">
                              {copy.callNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {copy.dueDate ? (
                              <span className="text-amber-800 font-medium">{copy.dueDate}</span>
                            ) : (
                              <span>Condition: {copy.condition}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* ================================================================ */}
          {/* RIGHT COLUMN: Strong Availability Card & Actions                 */}
          {/* ================================================================ */}
          <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
            {/* Visual Availability & Action Card */}
            <Card className="p-5 sm:p-6 bg-white shadow-xs space-y-5 border-slate-200/90">
              {/* Visually Strong Availability Indicator */}
              <StrongAvailabilityBanner
                availableCopies={book.availableCopies}
                totalCopies={book.totalCopies}
              />

              {/* Physical Location Details Block */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                  Physical Shelving Coordinates
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 block">
                        {book.location.library}
                      </span>
                      <span className="text-slate-500">{book.location.building}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Layers className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 block">
                        {book.location.floor}
                      </span>
                      <span className="text-slate-500">
                        {book.location.zone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        {book.location.aisle} · {book.location.shelf}
                      </span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        Call: {book.location.callNumber}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Access Status */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Digital Access
                </span>
                {book.digitalAvailable ? (
                  <div className="p-3 bg-sky-50 rounded-lg border border-sky-200/70 text-xs text-sky-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-sky-600" />
                      <span>Digital version available</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Physical monograph only (Special collections / in-copyright print edition).
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {isAvailable ? (
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full text-xs font-semibold"
                    leftIcon={<BookMarked className="w-4 h-4" />}
                    onClick={() => setIsReserveModalOpen(true)}
                  >
                    Reserve Physical Copy
                  </Button>
                ) : (
                  <Button
                    variant="accent"
                    size="md"
                    className="w-full text-xs font-semibold"
                    leftIcon={<Clock className="w-4 h-4" />}
                    onClick={() => {
                      toast.warning(
                        'Book Unavailable',
                        `All physical copies of "${book.title}" are currently on loan or reserved. Opening waitlist queue...`
                      );
                      setIsReserveModalOpen(true);
                    }}
                  >
                    Join Reservation Queue
                  </Button>
                )}

                <Link
                  to={`/navigate/${getShelfIdForBook(book)}?title=${encodeURIComponent(book.title)}&bookId=${encodeURIComponent(book.id)}`}
                  className="block"
                >
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full text-xs font-medium"
                    leftIcon={<Compass className="w-4 h-4 text-slate-700" />}
                  >
                    Navigate to Shelf
                  </Button>
                </Link>

                {book.digitalAvailable && (
                  <Link to={`/reader/${book.id}`} className="block">
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full text-xs font-medium"
                      leftIcon={<BookOpen className="w-4 h-4 text-sky-600" />}
                    >
                      Read Digitally
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

            {/* Quick Share / Citation Card */}
            <Card className="p-4 bg-white text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-500">Need academic citation?</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-sky-700 hover:text-sky-900 text-xs"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `${book.author}. (${book.publicationYear}). ${book.title}. ${book.publisher}. ISBN: ${book.isbn}.`
                  );
                  toast.success('Citation Copied', 'APA format citation copied to clipboard.');
                }}
              >
                Copy APA Citation
              </Button>
            </Card>
          </div>
        </div>

        {/* ================================================================ */}
        {/* RELATED RESOURCES SECTION (4 Books Based on Category/Dept)       */}
        {/* ================================================================ */}
        <section className="mt-16 pt-10 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <Kicker className="mb-0">Curated Library Recommendations</Kicker>
              <SectionHeading className="mt-1">
                Related Academic Resources
              </SectionHeading>
              <p className="text-xs text-slate-500 mt-0.5">
                Scholarly works frequently cross-referenced in {book.department} and {book.category}.
              </p>
            </div>
            <Link to="/discover" className="text-xs font-medium text-sky-700 hover:text-sky-900 shrink-0">
              Explore Complete Catalog →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedBooks.map((rel) => (
              <Card
                key={rel.id}
                interactive
                className="p-4 bg-white flex flex-col justify-between hover:border-slate-300"
              >
                <div>
                  {/* Related Cover Thumbnail */}
                  <Link to={`/book/${rel.id}`} className="block mb-3">
                    <div
                      className={`
                        w-full h-36 rounded-lg p-3 text-white flex flex-col justify-between select-none
                        bg-gradient-to-br ${rel.cover || 'from-slate-900 to-slate-950'}
                      `}
                    >
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-300 truncate">
                        {rel.department}
                      </span>
                      <h4 className="font-serif font-medium text-xs line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                      <span className="font-mono text-[9px] text-sky-300">
                        {rel.location.callNumber.split(' ')[0]}
                      </span>
                    </div>
                  </Link>

                  <div className="space-y-1">
                    <Link
                      to={`/book/${rel.id}`}
                      className="font-serif text-sm font-medium text-slate-900 hover:text-sky-900 line-clamp-1 block transition-colors"
                    >
                      {rel.title}
                    </Link>
                    <p className="text-xs text-slate-500 truncate">
                      {rel.author} ({rel.publicationYear})
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span
                    className={`inline-flex items-center gap-1 font-medium text-[11px] ${
                      rel.availableCopies > 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        rel.availableCopies > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    {rel.availableCopies > 0 ? `${rel.availableCopies} available` : 'Loaned out'}
                  </span>

                  <Link to={`/book/${rel.id}`}>
                    <Button variant="secondary" size="sm" className="text-xs h-7 px-2.5">
                      View
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </PageContainer>

      {/* ================================================================ */}
      {/* RESERVATION CONFIRMATION MODAL                                    */}
      {/* ================================================================ */}
      <ReservationModal
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
        book={book}
      />

      {/* ================================================================ */}
      {/* DIGITAL e-READER MODAL                                            */}
      {/* ================================================================ */}
      {isReaderModalOpen && (
        <Modal
          isOpen={isReaderModalOpen}
          onClose={() => setIsReaderModalOpen(false)}
          title={book.title}
          description={`${book.author} · University Institutional e-Book Edition`}
          maxWidth="lg"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-2 w-full">
              <span className="text-xs text-slate-500 font-mono">
                Reading Chapter 1 · Synced with Kite Reader
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsReaderModalOpen(false)}
              >
                Close Reader
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-serif">
            <div className="p-3 bg-sky-50 border border-sky-200/80 rounded-lg text-xs font-sans text-sky-950 flex flex-wrap items-center justify-between gap-2">
              <span>Institutional access active for {book.title}</span>
              <span className="font-mono text-sky-800 font-semibold">Page 1 / 420</span>
            </div>

            <h3 className="font-serif text-lg font-medium text-slate-900 border-b border-slate-100 pb-2">
              Chapter 1: Foundational Theoretical Frameworks
            </h3>

            <p>
              In scholarly analysis, foundational structures provide the conceptual vocabulary through which experimental phenomena and systematic models are comprehended. This monograph develops the formal representations and empirical observations required for advanced research.
            </p>

            <p>
              {book.abstract}
            </p>

            <p className="text-xs text-slate-500 font-sans italic">
              Digital bookmarks and annotations are automatically saved and synchronized with your patron account across campus devices.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

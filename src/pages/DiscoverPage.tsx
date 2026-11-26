import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { PageContainer } from '../layouts/PageContainer';
import { 
  DisplayHeading, 
  PageHeading, 
  SectionHeading, 
  Subheading, 
  MonospaceCallout, 
  Kicker 
} from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ReservationModal } from '../components/reservation/ReservationModal';
import { BookCardSkeleton } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { 
  LibraryService, 
  DiscoveryQueryOptions, 
  AvailabilityFilter, 
  SortOption,
  FacetCounts 
} from '../services/mockLibraryService';
import { getShelfIdForBook } from '../data/wayfindingData';
import { Book } from '../types';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  Compass, 
  BookMarked, 
  Laptop, 
  MapPin, 
  Building2, 
  Layers, 
  Check, 
  ArrowUpDown, 
  RotateCcw, 
  ExternalLink, 
  BookOpen, 
  Sparkles, 
  Tag, 
  Info,
  Calendar,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Availability Badge with explicit 🟢 🟡 🔴 Visual Semantics               */
/* -------------------------------------------------------------------------- */

interface AvailabilityBadgeProps {
  availableCopies: number;
  totalCopies: number;
  className?: string;
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  availableCopies,
  totalCopies,
  className = '',
}) => {
  if (availableCopies >= 3) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-heading uppercase font-bold tracking-wider bg-[#43C95E] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] ${className}`}>
        <span className="w-2 h-2 bg-[#111111] shrink-0" aria-hidden="true" />
        <span>AVAILABLE ({availableCopies}/{totalCopies})</span>
      </span>
    );
  }

  if (availableCopies >= 1) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-heading uppercase font-bold tracking-wider bg-[#FFD83D] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] ${className}`}>
        <span className="w-2 h-2 bg-[#111111] shrink-0" aria-hidden="true" />
        <span>LIMITED ({availableCopies}/{totalCopies})</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-heading uppercase font-bold tracking-wider bg-[#F05A79] text-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] ${className}`}>
      <span className="w-2 h-2 bg-[#FFFFFF] shrink-0" aria-hidden="true" />
      <span>UNAVAILABLE (0/{totalCopies})</span>
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Styled Academic Book Cover Component                                       */
/* -------------------------------------------------------------------------- */

interface AcademicBookCoverProps {
  book: Book;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AcademicBookCover: React.FC<AcademicBookCoverProps> = ({
  book,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-16 h-22 p-2',
    md: 'w-24 sm:w-28 h-34 sm:h-40 p-3',
    lg: 'w-36 h-52 p-4',
  };

  return (
    <div
      className={`
        relative rounded-none overflow-hidden shrink-0 border-3 border-[#111111] shadow-[4px_4px_0px_#111111]
        flex flex-col justify-between text-[#111111] select-none
        bg-[#FFFFFF] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#111111] transition-all
        ${sizeClasses[size]} ${className}
      `}
    >
      {/* Book Spine Texture Edge */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#111111] pointer-events-none" />

      {/* Header Department Pill */}
      <div className="relative z-10 pl-1">
        <span className="font-mono text-[9px] uppercase tracking-wider text-[#111111] bg-[#FFD83D] border border-[#111111] px-1 py-0.2 inline-block font-bold truncate">
          {book.resourceType}
        </span>
      </div>

      {/* Center Title in Bold Heading Face */}
      <div className="relative z-10 my-auto pl-1">
        <h4 className="font-heading font-black uppercase text-[10px] sm:text-xs leading-tight line-clamp-3 text-[#111111]">
          {book.title}
        </h4>
        <span className="block text-[9px] text-[#111111]/70 font-mono font-semibold mt-1 truncate">
          {book.author}
        </span>
      </div>

      {/* Footer Call Number */}
      <div className="relative z-10 pt-1 border-t-2 border-[#111111] pl-1">
        <span className="font-mono text-[9px] font-bold text-[#111111] block truncate">
          {book.location.callNumber.split(' ')[0]}
        </span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Smart Discovery Component                                            */
/* -------------------------------------------------------------------------- */

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Search and Facet States
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [department, setDepartment] = useState(searchParams.get('dept') || 'All');
  const [category, setCategory] = useState(searchParams.get('cat') || 'All');
  const [availability, setAvailability] = useState<AvailabilityFilter>(
    (searchParams.get('avail') as AvailabilityFilter) || 'all'
  );
  const [resourceType, setResourceType] = useState(searchParams.get('type') || 'All');
  const [author, setAuthor] = useState(searchParams.get('author') || 'All');
  const [digitalOnly, setDigitalOnly] = useState(searchParams.get('digital') === 'true');
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'relevance'
  );

  // Data states
  const [books, setBooks] = useState<Book[]>([]);
  const [facets, setFacets] = useState<FacetCounts | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);
  const [selectedBookForReserve, setSelectedBookForReserve] = useState<Book | null>(null);
  const [pickupLocation, setPickupLocation] = useState('Science Library · Smart Locker 14-B');
  const [isReserving, setIsReserving] = useState(false);
  const [mobileFilterDrawerOpen, setMobileFilterDrawerOpen] = useState(false);

  // Fetch facets once on mount and subscribe to updates
  useEffect(() => {
    LibraryService.getDiscoveryFacets().then(setFacets);

    const handleBooksUpdated = () => {
      LibraryService.getDiscoveryFacets().then(setFacets);
      const options: DiscoveryQueryOptions = {
        query,
        department,
        category,
        availability,
        resourceType,
        author,
        digitalOnly,
        sortBy,
      };
      LibraryService.getBooks(options).then(setBooks);
    };

    window.addEventListener('kite_ils_books_updated', handleBooksUpdated);
    return () => {
      window.removeEventListener('kite_ils_books_updated', handleBooksUpdated);
    };
  }, [query, department, category, availability, resourceType, author, digitalOnly, sortBy]);

  // Sync state to URL and execute search with brief debounce
  useEffect(() => {
    let isCurrent = true;
    setLoading(true);

    const timer = setTimeout(() => {
      const options: DiscoveryQueryOptions = {
        query,
        department,
        category,
        availability,
        resourceType,
        author,
        digitalOnly,
        sortBy,
      };

      LibraryService.getBooks(options).then((res) => {
        if (isCurrent) {
          setBooks(res);
          setLoading(false);
        }
      });
    }, 120);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query, department, category, availability, resourceType, author, digitalOnly, sortBy]);

  // Sync to URL parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (department !== 'All') params.set('dept', department);
    if (category !== 'All') params.set('cat', category);
    if (availability !== 'all') params.set('avail', availability);
    if (resourceType !== 'All') params.set('type', resourceType);
    if (author !== 'All') params.set('author', author);
    if (digitalOnly) params.set('digital', 'true');
    if (sortBy !== 'relevance') params.set('sort', sortBy);

    setSearchParams(params, { replace: true });
  }, [query, department, category, availability, resourceType, author, digitalOnly, sortBy, setSearchParams]);

  // Reset all filters
  const handleResetFilters = () => {
    setQuery('');
    setDepartment('All');
    setCategory('All');
    setAvailability('all');
    setResourceType('All');
    setAuthor('All');
    setDigitalOnly(false);
    setSortBy('relevance');
  };

  const hasActiveFilters =
    query.trim() !== '' ||
    department !== 'All' ||
    category !== 'All' ||
    availability !== 'all' ||
    resourceType !== 'All' ||
    author !== 'All' ||
    digitalOnly ||
    sortBy !== 'relevance';

  // Handle book reservation
  const handleConfirmReservation = async () => {
    if (!selectedBookForReserve) return;
    setIsReserving(true);
    try {
      await LibraryService.reserveBook(selectedBookForReserve.id, pickupLocation);
      setIsReserving(false);
      const bookTitle = selectedBookForReserve.title;
      setSelectedBookForReserve(null);
      toast.success(
        'Physical Book Reserved',
        `"${bookTitle}" will be delivered to ${pickupLocation}. Pickup passcode will be dispatched on arrival.`
      );
    } catch {
      setIsReserving(false);
      toast.error('Reservation Error', 'Unable to reach the automated locker service.');
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col">
      {/* 1. TOP DISCOVERY SEARCH HERO */}
      <section className="bg-white border-b border-slate-200/80 pt-10 pb-8 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 block mb-2 select-none">
              Smart Academic Discovery · Universal Catalog
            </span>
            <DisplayHeading className="text-3xl sm:text-4xl lg:text-5xl font-normal">
              What are you looking for?
            </DisplayHeading>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Explore 84,000+ volumes, monographs, and course reserves across all university faculties with real-time physical availability.
            </p>
          </div>

          {/* Large Search Input Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search books, authors, subjects, ISBN..."
                className="w-full h-12 pl-11 pr-12 text-sm sm:text-base bg-white text-slate-900 border border-slate-300/90 rounded-xl shadow-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 sm:right-3.5 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <Button
              variant="secondary"
              size="lg"
              className="lg:hidden shrink-0 h-12"
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              onClick={() => setMobileFilterDrawerOpen(true)}
            >
              Filters {hasActiveFilters && '•'}
            </Button>
          </div>

          {/* Quick Department Tags Ribbon */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-slate-400 whitespace-nowrap mr-1 select-none text-[11px] uppercase tracking-wider font-semibold">
              Departments:
            </span>
            {[
              'All',
              'Computer Science',
              'Mathematics',
              'Physics',
              'Electronics',
              'Mechanical Engineering',
              'Civil Engineering',
              'English',
              'Economics',
            ].map((dept) => {
              const isActive = department === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => {
                    setDepartment(dept);
                    setCategory('All');
                  }}
                  className={`
                    min-h-[36px] md:min-h-0 px-3 py-1.5 md:py-1 rounded-full whitespace-nowrap transition-colors text-xs font-medium cursor-pointer
                    ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                    }
                  `}
                >
                  {dept}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. MAIN DISCOVERY WORKSPACE: FILTERS + RESULTS */}
      <PageContainer maxWidth="standard" className="flex-1 py-8">
        <div className="flex items-start gap-8">
          {/* DESKTOP FILTERS SIDEBAR */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                  Discovery Filters
                </span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 hover:text-sky-900 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset all
                </button>
              )}
            </div>

            {/* 1. Availability Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                Physical Availability
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Catalog Records', count: facets?.availabilityCounts.all },
                  { id: 'available', label: '🟢 Available (3+ on shelf)', count: facets?.availabilityCounts.available },
                  { id: 'limited', label: '🟡 Limited Availability (1-2 copies)', count: facets?.availabilityCounts.limited },
                  { id: 'unavailable', label: '🔴 Unavailable (0 copies)', count: facets?.availabilityCounts.unavailable },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAvailability(item.id as AvailabilityFilter)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left
                      ${
                        availability === item.id
                          ? 'bg-slate-900 text-white font-medium shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }
                    `}
                  >
                    <span className="truncate">{item.label}</span>
                    {typeof item.count === 'number' && (
                      <span className={`font-mono text-[11px] ml-1.5 ${availability === item.id ? 'text-sky-300' : 'text-slate-400'}`}>
                        ({item.count})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Department Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setCategory('All');
                }}
                className="w-full h-10 px-3 bg-white text-slate-900 text-xs border border-slate-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="All">All Departments</option>
                {facets?.departments.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.count})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Category / Subject Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                Category & Subject
              </label>
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                <button
                  type="button"
                  onClick={() => setCategory('All')}
                  className={`
                    w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between
                    ${
                      category === 'All'
                        ? 'bg-sky-50 text-sky-900 font-semibold border-l-2 border-sky-600'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <span>All Categories</span>
                </button>
                {facets?.categories.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCategory(c.name)}
                    className={`
                      w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between
                      ${
                        category === c.name
                          ? 'bg-sky-50 text-sky-900 font-semibold border-l-2 border-sky-600'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }
                    `}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">({c.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Resource Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                Resource Type
              </label>
              <div className="space-y-1">
                {['All', 'Book', 'Course Reserve', 'Research Monograph', 'Journal Volume'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setResourceType(type)}
                    className={`
                      w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between
                      ${
                        resourceType === type
                          ? 'bg-slate-100 text-slate-900 font-semibold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }
                    `}
                  >
                    <span>{type === 'All' ? 'All Formats' : type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Author Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                Author
              </label>
              <select
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full h-10 px-3 bg-white text-slate-900 text-xs border border-slate-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="All">All Authors</option>
                {facets?.authors.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} ({a.count})
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Digital Access Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={digitalOnly}
                  onChange={(e) => setDigitalOnly(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <span>Instant Digital / e-Book Only</span>
              </label>
            </div>
          </aside>

          {/* RESULTS AREA */}
          <main className="flex-1 min-w-0 space-y-4">
            {/* Results Header: Count & Sort Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
              <div className="text-xs text-slate-500">
                Displaying{' '}
                <strong className="text-slate-900 font-mono tabular-nums font-semibold">
                  {books.length}
                </strong>{' '}
                curated academic resources
                {query && <span> for "<span className="text-slate-900 font-medium">{query}</span>"</span>}
                {department !== 'All' && <span> in <strong className="text-slate-900">{department}</strong></span>}
              </div>

              {/* Sort Options Selector */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-8 px-2.5 bg-white text-slate-800 text-xs font-medium border border-slate-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="title">Title (A – Z)</option>
                  <option value="recently_added">Recently Added</option>
                  <option value="availability">Availability (High to Low)</option>
                </select>
              </div>
            </div>

            {/* LOADING STATE */}
            {loading ? (
              <div className="space-y-4">
                <BookCardSkeleton />
                <BookCardSkeleton />
                <BookCardSkeleton />
                <BookCardSkeleton />
              </div>
            ) : books.length === 0 ? (
              /* NO RESULTS STATE */
              <EmptyState
                title="No Academic Resources Found"
                description={`We couldn't find any resources matching your search "${query}". Try adjusting keywords, removing specific department filters, or check spelling.`}
                actionLabel="Clear All Filters"
                onAction={handleResetFilters}
                secondaryActionLabel="Submit Acquisition Request"
                onSecondaryAction={() => navigate('/requests')}
              />
            ) : (
              /* BOOK RESULTS LIST */
              <div className="space-y-4">
                {books.map((book) => (
                  <Card
                    key={book.id}
                    interactive
                    className="p-5 sm:p-6 bg-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_#111111] transition-all flex flex-col md:flex-row gap-5 items-start"
                  >
                    {/* Visual Academic Book Cover */}
                    <Link to={`/book/${book.id}`} className="block focus:outline-none shrink-0">
                      <AcademicBookCover book={book} size="md" />
                    </Link>

                    {/* Book Metadata Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-3">
                      <div>
                        {/* Status Badges Row */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <AvailabilityBadge
                            availableCopies={book.availableCopies}
                            totalCopies={book.totalCopies}
                          />

                          <span className="font-mono text-xs font-bold text-[#111111] bg-[#FFD83D] px-2 py-0.5 border border-[#111111] shadow-[1px_1px_0px_#111111]">
                            {book.location.callNumber}
                          </span>

                          <span className="text-[11px] font-heading font-bold uppercase text-[#111111] bg-[#FFFFFF] px-2 py-0.5 border border-[#111111]">
                            {book.department}
                          </span>

                          {book.digitalAvailable && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase text-[#FFFFFF] bg-[#24A9C7] px-2 py-0.5 border border-[#111111] shadow-[1px_1px_0px_#111111]">
                              <Laptop className="w-3 h-3 text-[#FFFFFF]" />
                              E-BOOK AVAILABLE
                            </span>
                          )}
                        </div>

                        {/* Title & Subtitle */}
                        <Link to={`/book/${book.id}`} className="block group focus:outline-none">
                          <h3 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-tight text-[#111111] group-hover:text-[#F26B32] transition-colors leading-snug">
                            {book.title}
                          </h3>
                        </Link>

                        {book.subtitle && (
                          <p className="text-xs text-[#111111]/70 font-medium mt-0.5 line-clamp-1">
                            {book.subtitle}
                          </p>
                        )}

                        {/* Author & Publication Metadata */}
                        <div className="flex items-center flex-wrap gap-1.5 text-xs text-[#111111]/80 mt-1.5 font-medium">
                          <span className="font-bold text-[#111111]">
                            {book.author}
                          </span>
                          {book.authors.length > 1 && (
                            <span>(+{book.authors.length - 1} contributor)</span>
                          )}
                          <span>·</span>
                          <span>{book.publisher}</span>
                          <span>·</span>
                          <span>{book.publicationYear}</span>
                          <span>·</span>
                          <span className="font-mono text-[11px] text-[#111111]/60">ISBN: {book.isbn}</span>
                        </div>

                        {/* Academic Description */}
                        <p className="text-xs sm:text-sm text-[#111111]/80 mt-2.5 line-clamp-2 leading-relaxed">
                          {book.description}
                        </p>
                      </div>

                      {/* Physical Location Strip */}
                      <div className="pt-3 border-t-2 border-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#111111] font-medium">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-[#F26B32] shrink-0" />
                          <span className="font-bold">
                            {book.location.library}
                          </span>
                          <span>·</span>
                          <span className="font-mono font-bold bg-[#FFD83D] px-1.5 border border-[#111111]">{book.location.floor} ({book.location.shelf})</span>
                        </div>

                        {/* 3 Explicit Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <Link to={`/book/${book.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Eye className="w-3.5 h-3.5" />}
                            >
                              VIEW DETAILS
                            </Button>
                          </Link>

                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<BookMarked className="w-3.5 h-3.5" />}
                            onClick={() => {
                              if (book.availableCopies === 0) {
                                toast.warning(
                                  'Book Unavailable',
                                  `All physical copies of "${book.title}" are currently in circulation. Opening reservation waitlist...`
                                );
                              }
                              setSelectedBookForReserve(book);
                            }}
                          >
                            RESERVE
                          </Button>

                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Compass className="w-3.5 h-3.5" />}
                            onClick={() => {
                              const shelfCode = getShelfIdForBook(book);
                              navigate(`/navigate/${shelfCode}?title=${encodeURIComponent(book.title)}&bookId=${encodeURIComponent(book.id)}`);
                            }}
                          >
                            NAVIGATE
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </PageContainer>

      {/* 3. MODAL: VIEW DETAILS */}
      {selectedBookForDetails && (
        <Modal
          isOpen={Boolean(selectedBookForDetails)}
          onClose={() => setSelectedBookForDetails(null)}
          title={selectedBookForDetails.title}
          description={`${selectedBookForDetails.author} · ${selectedBookForDetails.publisher} (${selectedBookForDetails.publicationYear})`}
          maxWidth="lg"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
              <AvailabilityBadge
                availableCopies={selectedBookForDetails.availableCopies}
                totalCopies={selectedBookForDetails.totalCopies}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBookForDetails(null)}
                >
                  Close
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<BookMarked className="w-3.5 h-3.5" />}
                  onClick={() => {
                    const b = selectedBookForDetails;
                    setSelectedBookForDetails(null);
                    setSelectedBookForReserve(b);
                  }}
                >
                  Reserve Copy
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Compass className="w-3.5 h-3.5" />}
                  onClick={() => {
                    const shelfCode = getShelfIdForBook(selectedBookForDetails);
                    navigate(`/navigate/${shelfCode}?title=${encodeURIComponent(selectedBookForDetails.title)}&bookId=${encodeURIComponent(selectedBookForDetails.id)}`);
                  }}
                >
                  Navigate to Shelf
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs sm:text-sm">
            {/* Primary Details Layout */}
            <div className="flex flex-col sm:flex-row gap-5">
              <AcademicBookCover book={selectedBookForDetails} size="lg" />

              <div className="space-y-3 flex-1">
                <div>
                  <h4 className="font-serif text-lg font-medium text-slate-900">
                    {selectedBookForDetails.title}
                  </h4>
                  {selectedBookForDetails.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedBookForDetails.subtitle}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 block uppercase">Department</span>
                    <span className="font-medium text-slate-900">{selectedBookForDetails.department}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 block uppercase">Category</span>
                    <span className="font-medium text-slate-900">{selectedBookForDetails.category}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 block uppercase">Call Number</span>
                    <span className="font-mono text-slate-900 font-semibold">{selectedBookForDetails.location.callNumber}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 block uppercase">Standard ISBN</span>
                    <span className="font-mono text-slate-900">{selectedBookForDetails.isbn}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-400 block uppercase mb-1">
                    Shelf-Level Physical Coordinates
                  </span>
                  <div className="text-slate-800 font-medium text-xs">
                    {selectedBookForDetails.location.building} · {selectedBookForDetails.location.floor} · {selectedBookForDetails.location.zone}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {selectedBookForDetails.location.aisle} · {selectedBookForDetails.location.shelf}
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Abstract */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                Academic Synopsis
              </h5>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                {selectedBookForDetails.description}
              </p>
              <p className="text-slate-500 leading-relaxed text-xs pt-1">
                {selectedBookForDetails.abstract}
              </p>
            </div>

            {/* Digital Access Availability */}
            {selectedBookForDetails.digitalAvailable && (
              <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-sky-600" />
                  <span className="text-xs text-sky-950 font-medium">
                    Instant e-Book reader copy available on student portal.
                  </span>
                </div>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => {
                    navigate('/dashboard');
                    toast.info('e-Reader Active', `Opening "${selectedBookForDetails.title}" in reader.`);
                  }}
                >
                  Open in e-Reader
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 4. MODAL: RESERVE BOOK */}
      <ReservationModal
        isOpen={Boolean(selectedBookForReserve)}
        onClose={() => setSelectedBookForReserve(null)}
        book={selectedBookForReserve}
      />

      {/* 5. MOBILE DRAWER FILTERS */}
      {mobileFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileFilterDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full h-[100dvh] bg-white p-5 sm:p-6 shadow-2xl overflow-y-auto overscroll-contain space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-serif text-lg font-medium text-slate-900">
                Filters & Facets
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileFilterDrawerOpen(false)}
              >
                Done
              </Button>
            </div>

            {/* Mobile Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-11 px-3 bg-white text-slate-900 text-base md:text-xs border border-slate-200 rounded-lg"
              >
                <option value="All">All Departments</option>
                {facets?.departments.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Availability */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                Availability
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Catalog Records' },
                  { id: 'available', label: '🟢 Available (3+)' },
                  { id: 'limited', label: '🟡 Limited Availability (1-2)' },
                  { id: 'unavailable', label: '🔴 Unavailable (0)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAvailability(item.id as AvailabilityFilter)}
                    className={`w-full min-h-[44px] text-left px-3 py-2.5 rounded-lg text-xs cursor-pointer ${
                      availability === item.id ? 'bg-slate-900 text-white font-medium' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full mt-4"
              onClick={() => setMobileFilterDrawerOpen(false)}
            >
              Apply Filters ({books.length} matches)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

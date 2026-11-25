import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageContainer } from '../layouts/PageContainer';
import { 
  PageHeading, 
  SectionHeading, 
  Subheading, 
  MonospaceCallout, 
  Kicker 
} from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { StatusIndicator, FormatBadge, MetadataSeparator } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { 
  ReadingProgressService, 
  ReadingProgress, 
  Bookmark as BookmarkType, 
  ReadingNote 
} from '../services/readingProgressService';
import { 
  mockContinueReadingItem, 
  mockStudentUpcomingReservations, 
  mockStudentActivities,
  mockBooks,
  StudentDashboardReservation,
  StudentActivityItem
} from '../data/mockData';
import { LibraryService } from '../services/mockLibraryService';
import { Book } from '../types';
import { 
  Search, 
  Compass, 
  BookMarked, 
  FolderPlus, 
  Laptop, 
  ArrowRight, 
  Clock, 
  Key, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Bookmark, 
  RotateCcw, 
  ExternalLink,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileText,
  BookmarkCheck,
  History
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Reusable Sub-Components                                                   */
/* -------------------------------------------------------------------------- */

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  badge?: string;
  accent?: boolean;
}

const QuickActionCard: React.FC<QuickActionProps> = ({
  title,
  description,
  icon,
  to,
  badge,
  accent = false,
}) => (
  <Link to={to} className="group block focus:outline-none">
    <Card 
      interactive 
      className={`h-full p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 border ${
        accent ? 'bg-gradient-to-br from-white to-sky-50/40 border-sky-200/90 shadow-2xs hover:border-sky-300' : 'bg-white border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-700 group-hover:border-sky-200 transition-colors">
            {icon}
          </div>
          {badge && (
            <span className="font-mono text-[11px] font-medium text-sky-800 bg-sky-50 border border-sky-200/70 px-2 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
        <h3 className="font-serif text-lg font-medium text-slate-900 group-hover:text-sky-900 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600 group-hover:text-sky-700 transition-colors">
        <span>Open section</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Card>
  </Link>
);

interface StatMetricProps {
  label: string;
  count: number | string;
  subtitle: string;
  to?: string;
  highlight?: boolean;
}

const StatMetricCard: React.FC<StatMetricProps> = ({
  label,
  count,
  subtitle,
  to,
  highlight = false,
}) => {
  const content = (
    <Card className={`p-5 h-full flex flex-col justify-between ${
      highlight ? 'border-sky-200/80 bg-white ring-1 ring-sky-100' : 'bg-white'
    }`}>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
          {label}
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-serif text-3xl font-medium tracking-tight text-slate-900 tabular-nums">
            {count}
          </span>
        </div>
      </div>
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 truncate">{subtitle}</span>
        {to && <span className="font-medium text-sky-700 hover:text-sky-900 shrink-0 ml-1">View →</span>}
      </div>
    </Card>
  );

  return to ? <Link to={to} className="block focus:outline-none">{content}</Link> : content;
};

/* -------------------------------------------------------------------------- */
/* Main Student Dashboard Component                                           */
/* -------------------------------------------------------------------------- */

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State for simulated E-Reader reading modal
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [readingItem, setReadingItem] = useState(mockContinueReadingItem);

  // Digital Access & Smart Sync extensions
  const [readingHistory, setReadingHistory] = useState<ReadingProgress[]>([]);
  const [userBookmarks, setUserBookmarks] = useState<BookmarkType[]>([]);
  const [userNotes, setUserNotes] = useState<ReadingNote[]>([]);
  const [activeReadingSubTab, setActiveReadingSubTab] = useState<'history' | 'bookmarks' | 'notes'>('history');

  // State for active reservations
  const [reservations, setReservations] = useState<StudentDashboardReservation[]>(
    mockStudentUpcomingReservations
  );
  // State for recommended books
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);

  // Function to load all live dashboard data
  const loadDashboardData = () => {
    // 1. Reading progress
    ReadingProgressService.getMostRecentBook().then((recent) => {
      if (!recent) return;
      setReadingItem({
        id: recent.bookId,
        bookId: recent.bookId,
        title: recent.bookTitle,
        subtitle: '',
        authors: [recent.bookAuthor],
        chapter: recent.chapter,
        currentPage: recent.currentPage,
        totalPages: recent.totalPages,
        progressPercentage: recent.progressPercentage,
        lastOpened: recent.lastOpened,
        callNumber: recent.callNumber || 'QA76.73 .C15 D38 2023',
        digitalUrl: `/reader/${recent.bookId}`,
      });

      ReadingProgressService.getBookmarks(recent.bookId).then(setUserBookmarks);
      ReadingProgressService.getNotes(recent.bookId).then(setUserNotes);
    });

    ReadingProgressService.getReadingHistory().then(setReadingHistory);

    // 2. Reservations
    LibraryService.getReservations().then((raw) => {
      const activeOrReady = raw.filter((r) => r.status !== 'cancelled' && r.status !== 'completed');
      if (activeOrReady.length > 0) {
        const mapped: StudentDashboardReservation[] = activeOrReady.map((r) => {
          const isReady = r.status === 'ready_for_pickup';
          const isExpiring = r.status === 'expired';
          let statusLabel = 'Hold Queued';
          if (isReady) statusLabel = 'Ready for Pickup';
          else if (isExpiring) statusLabel = 'Expiring Soon';
          else if (r.status === 'active') statusLabel = 'Hold Active';

          return {
            id: r.id,
            bookId: r.bookId,
            bookTitle: r.bookTitle,
            callNumber: r.callNumber,
            pickupLocation: r.pickupLocation,
            pickupLocker: r.pickupLocker || (isReady ? 'Smart Locker #14B (Code: 4821)' : undefined),
            status: statusLabel as any,
            reservedDate: r.reservedAt ? new Date(r.reservedAt).toLocaleDateString() : 'Today',
            expiresText: isReady ? 'Expires in 42 hours' : 'Transit: Processing',
            isUrgent: isReady,
            shelf: r.shelf || 'CS-204',
            token: r.claimToken || 'KITE-4821',
          };
        });
        setReservations(mapped);
      } else {
        setReservations(mockStudentUpcomingReservations);
      }
    });

    // 3. Recommended Books
    LibraryService.getBooks({}).then((books) => {
      setRecommendedBooks(books);
    });
  };

  // Load persistent reading progress & live reservations on mount and subscribe to updates
  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener('kite_ils_reading_progress_updated', handleUpdate);
    window.addEventListener('kite_ils_reservations_updated', handleUpdate);
    window.addEventListener('kite_ils_books_updated', handleUpdate);

    return () => {
      window.removeEventListener('kite_ils_reading_progress_updated', handleUpdate);
      window.removeEventListener('kite_ils_reservations_updated', handleUpdate);
      window.removeEventListener('kite_ils_books_updated', handleUpdate);
    };
  }, []);

  const studentName = user?.fullName?.split(' ')[0] || 'Alex';

  // Greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleAdvancePage = () => {
    if (readingItem.currentPage < readingItem.totalPages) {
      const nextPage = readingItem.currentPage + 1;
      const nextProgress = Math.round((nextPage / readingItem.totalPages) * 100);
      setReadingItem((prev) => ({
        ...prev,
        currentPage: nextPage,
        progressPercentage: nextProgress,
      }));
      toast.success('Reading Progress Synced', `Saved at Page ${nextPage} (${nextProgress}% complete).`);
    }
  };

  // Check if there are urgent pickup items
  const urgentPickup = reservations.find((r) => r.status === 'Ready for Pickup');

  return (
    <div className="flex-1 bg-slate-50 pb-16">
      {/* HEADER SECTION */}
      <section className="bg-white border-b border-slate-200/80 pt-8 pb-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Kicker className="mb-0">Patron Command Center</Kicker>
                <MetadataSeparator />
                <span className="font-mono text-xs text-slate-500 font-medium">
                  {user?.patronNumber || 'KIT-2026-4401'}
                </span>
                <MetadataSeparator />
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                  Active Standing
                </span>
              </div>
              <PageHeading>
                {getGreeting()}, {studentName}
              </PageHeading>
              <Subheading className="mt-1">
                Everything you need from the library, in one place.
              </Subheading>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/discover">
                <Button variant="primary" size="md" leftIcon={<Search className="w-4 h-4" />}>
                  Find Books
                </Button>
              </Link>
              <Link to="/navigate">
                <Button variant="secondary" size="md" leftIcon={<Compass className="w-4 h-4" />}>
                  Stacks Map
                </Button>
              </Link>
            </div>
          </div>

          {/* ACTION REQUIRED: Urgent Pickup Alert Banner */}
          {urgentPickup && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-50/90 border border-emerald-300/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
                      Action Required · Ready for Pickup
                    </span>
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {urgentPickup.expiresText}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-emerald-950 mt-0.5">
                    <strong>"{urgentPickup.bookTitle}"</strong> is in {urgentPickup.pickupLocation}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center">
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-emerald-800 hover:bg-emerald-900 border-emerald-900 text-xs"
                  onClick={() => {
                    toast.success(
                      'Locker Retrieval Code',
                      `${urgentPickup.pickupLocker} · Tap your university smart card or enter the 4-digit code on the touch terminal.`
                    );
                  }}
                >
                  View Locker Passcode
                </Button>
                <Link to="/reservations">
                  <Button variant="secondary" size="sm" className="text-xs">
                    All Holds
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <PageContainer maxWidth="standard" className="space-y-12 mt-4">
        {/* SECTION 1 — QUICK ACTIONS (Four Large Action Cards) */}
        <section aria-labelledby="quick-actions-heading">
          <div className="flex items-center justify-between mb-4">
            <SectionHeading id="quick-actions-heading">
              Quick Actions
            </SectionHeading>
            <span className="text-xs text-slate-400">
              Personal library shortcuts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="1. Find a Book"
              description="Search physical monographs, course reserves, and research journals across all campus stacks."
              icon={<Search className="w-5 h-5" />}
              to="/discover"
              badge="84,000+ volumes"
              accent={true}
            />

            <QuickActionCard
              title="2. My Reservations"
              description="Inspect active book hold queues, automated pickup lockers, and retrieval passcode status."
              icon={<BookMarked className="w-5 h-5" />}
              to="/reservations"
              badge="2 active holds"
            />

            <QuickActionCard
              title="3. Navigate"
              description="Access indoor turn-by-turn wayfinding maps straight to the specific floor, aisle bay, and shelf."
              icon={<Compass className="w-5 h-5" />}
              to="/navigate"
              badge="Turing Level 3"
            />

            <QuickActionCard
              title="4. Request a Book"
              description="Recommend new academic monograph purchases or submit syllabus course reserve additions."
              icon={<FolderPlus className="w-5 h-5" />}
              to="/requests"
              badge="Faculty approved"
            />
          </div>
        </section>

        {/* SECTION 2 & SECTION 3 (Split Grid: Continue Reading & My Library Summary) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SECTION 2 — CONTINUE READING (e-Reader / Synced Bookmark Card) */}
          <section aria-labelledby="continue-reading-heading" className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <SectionHeading id="continue-reading-heading">
                Continue Reading
              </SectionHeading>
              <span className="text-xs font-mono text-slate-400">
                Last opened {readingItem.lastOpened}
              </span>
            </div>

            <Card className="p-6 bg-white border-slate-200/80 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                      Synchronized eBook & Notes
                    </span>
                    <MetadataSeparator />
                    <MonospaceCallout>{readingItem.callNumber}</MonospaceCallout>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-slate-900 leading-snug">
                    {readingItem.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    By {readingItem.authors.join(', ')}
                  </p>

                  <div className="pt-2 text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{readingItem.chapter}</span>
                  </div>
                </div>

                {/* Progress Metric Ring / Pill */}
                <div className="sm:text-right shrink-0">
                  <span className="text-3xl font-serif font-medium text-slate-900 tabular-nums">
                    {readingItem.progressPercentage}%
                  </span>
                  <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                    complete
                  </span>
                </div>
              </div>

              {/* Progress Bar & Page Metrics */}
              <div className="mt-5 space-y-2">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${readingItem.progressPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Page <strong className="text-slate-800 font-semibold tabular-nums">{readingItem.currentPage}</strong> of{' '}
                    <strong className="text-slate-800 font-semibold tabular-nums">{readingItem.totalPages}</strong>
                  </span>
                  <span>{readingItem.totalPages - readingItem.currentPage} pages remaining</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 hidden sm:inline-block">
                  Bookmark synced with Kite mobile & web reader
                </span>
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate(`/reader/${readingItem.bookId || 'bk-cs-04'}`)}
                  className="w-full sm:w-auto"
                >
                  Continue Reading
                </Button>
              </div>
            </Card>

            {/* Smart Sync Extensions: Reading History | Bookmarks | Basic Notes */}
            <div className="mt-4 bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveReadingSubTab('history')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeReadingSubTab === 'history'
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Reading History</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveReadingSubTab('bookmarks')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeReadingSubTab === 'bookmarks'
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>Bookmarks ({userBookmarks.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveReadingSubTab('notes')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeReadingSubTab === 'notes'
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Study Notes ({userNotes.length})</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
                  Smart Sync: Local Active
                </span>
              </div>

              {/* Subtab 1: Reading History */}
              {activeReadingSubTab === 'history' && (
                <div className="space-y-2">
                  {readingHistory.map((item) => (
                    <div
                      key={item.bookId}
                      className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-serif font-semibold text-slate-900 truncate block">
                          {item.bookTitle}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{item.chapter}</span>
                          <span>·</span>
                          <span>p. {item.currentPage} of {item.totalPages}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs font-bold text-sky-800">
                          {item.progressPercentage}%
                        </span>
                        <Link to={`/reader/${item.bookId}`}>
                          <Button variant="secondary" size="sm" className="text-xs h-7 px-2.5">
                            Resume
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Subtab 2: Bookmarks */}
              {activeReadingSubTab === 'bookmarks' && (
                <div className="space-y-2">
                  {userBookmarks.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      No bookmarks saved yet. Use the bookmark icon in the e-reader.
                    </div>
                  ) : (
                    userBookmarks.map((bm) => (
                      <div
                        key={bm.id}
                        className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[10px] text-sky-700 uppercase">
                              Page {bm.pageNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate">{bm.chapterTitle}</span>
                          </div>
                          <p className="font-serif italic text-slate-700 text-xs mt-0.5 truncate">
                            "{bm.snippet}"
                          </p>
                        </div>
                        <Link to={`/reader/${bm.bookId}`}>
                          <Button variant="secondary" size="sm" className="text-xs h-7 px-2.5">
                            Open
                          </Button>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Subtab 3: Basic Notes */}
              {activeReadingSubTab === 'notes' && (
                <div className="space-y-2">
                  {userNotes.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      No notes recorded yet. Annotations created in the e-reader sync here.
                    </div>
                  ) : (
                    userNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-2.5 rounded-lg border border-amber-200/60 bg-amber-50/30 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[10px] text-amber-800">
                              Page {note.pageNumber}
                            </span>
                            <span className="text-[10px] text-slate-400">{note.updatedAt}</span>
                          </div>
                          <p className="text-slate-800 text-xs mt-0.5 leading-snug">
                            {note.content}
                          </p>
                        </div>
                        <Link to={`/reader/${note.bookId}`}>
                          <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                            View
                          </Button>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </section>

          {/* SECTION 3 — MY LIBRARY SUMMARY CARDS */}
          <section aria-labelledby="my-library-heading" className="lg:col-span-5">
            <div className="flex items-center justify-between mb-4">
              <SectionHeading id="my-library-heading">
                My Library
              </SectionHeading>
              <Link to="/my-library" className="text-xs font-medium text-sky-700 hover:text-sky-900">
                View all loans →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <StatMetricCard
                label="Borrowed"
                count={3}
                subtitle="1 renewal eligible"
                to="/my-library"
                highlight={true}
              />

              <StatMetricCard
                label="Reserved"
                count={reservations.length}
                subtitle={urgentPickup ? '1 ready for pickup' : `${reservations.length} active holds`}
                to="/reservations"
                highlight={true}
              />

              <StatMetricCard
                label="Digital Reading"
                count={1}
                subtitle="Active e-Reader"
                to="/dashboard"
              />

              <StatMetricCard
                label="Pending Requests"
                count={1}
                subtitle="Under review"
                to="/requests"
              />
            </div>
          </section>
        </div>

        {/* SECTION 4 — UPCOMING RESERVATIONS */}
        <section aria-labelledby="upcoming-reservations-heading">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80">
            <div>
              <SectionHeading id="upcoming-reservations-heading">
                Upcoming Reservations & Holds
              </SectionHeading>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical monographs awaiting locker retrieval or circulation desk transit.
              </p>
            </div>
            <Link to="/reservations" className="text-xs font-medium text-sky-700 hover:text-sky-900">
              Manage Reservations ({reservations.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reservations.map((res) => {
              const isReady = res.status === 'Ready for Pickup';
              const isExpiring = res.status === 'Expiring Soon';

              return (
                <Card
                  key={res.id}
                  className={`flex flex-col justify-between ${
                    isReady
                      ? 'border-emerald-300 bg-white ring-1 ring-emerald-100'
                      : isExpiring
                      ? 'border-amber-300 bg-white ring-1 ring-amber-100'
                      : 'bg-white'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {/* Status indicator with subtle urgent styling */}
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          isReady
                            ? 'text-emerald-800'
                            : isExpiring
                            ? 'text-amber-800'
                            : 'text-slate-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ring-2 ${
                            isReady
                              ? 'bg-emerald-500 ring-emerald-200'
                              : isExpiring
                              ? 'bg-amber-500 ring-amber-200'
                              : 'bg-sky-500 ring-sky-200'
                          }`}
                        />
                        <span>{res.status}</span>
                      </span>

                      <MonospaceCallout>{res.callNumber}</MonospaceCallout>
                    </div>

                    <CardTitle className="text-base line-clamp-1">
                      {res.bookTitle}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3 py-2">
                    {/* Pickup Location */}
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[11px] uppercase">
                          Pickup Location
                        </span>
                        <span className="font-medium text-slate-800">
                          {res.pickupLocation}
                        </span>
                      </div>
                    </div>

                    {/* Locker Code & Expiry Time */}
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock className={`w-3.5 h-3.5 ${res.isUrgent ? 'text-amber-600' : 'text-slate-400'}`} />
                        <span className={res.isUrgent ? 'font-medium text-slate-900' : 'text-slate-600'}>
                          {res.expiresText}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-slate-50/50">
                    {res.pickupLocker ? (
                      <span className="text-[11px] font-mono font-medium text-emerald-800">
                        {res.pickupLocker}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Transit status: Queued
                      </span>
                    )}

                    <Button
                      variant={isReady ? 'accent' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        if (isReady && res.pickupLocker) {
                          toast.success('Pickup Passcode Active', res.pickupLocker);
                        } else {
                          navigate('/reservations');
                        }
                      }}
                    >
                      {isReady ? 'Access Locker' : 'Hold Details'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>

        {/* SECTION 5 — RECOMMENDED RESOURCES (Mock Books for Student's Discipline) */}
        <section aria-labelledby="recommended-resources-heading">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80">
            <div>
              <SectionHeading id="recommended-resources-heading">
                Recommended Resources
              </SectionHeading>
              <p className="text-xs text-slate-500 mt-0.5">
                Curated monographs matching your research in Computer Science & Distributed Systems.
              </p>
            </div>
            <Link to="/discover" className="text-xs font-medium text-sky-700 hover:text-sky-900">
              Explore Complete Catalog →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(recommendedBooks.length > 0 ? recommendedBooks.slice(0, 3) : mockBooks.slice(0, 3)).map((book) => (
              <Card key={book.id} interactive className="flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <StatusIndicator status={book.status} />
                      <MonospaceCallout>{book.location.callNumber}</MonospaceCallout>
                    </div>

                    <CardTitle className="text-base line-clamp-1">
                      {book.title}
                    </CardTitle>

                    {book.subtitle && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {book.subtitle}
                      </p>
                    )}

                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                      <span className="font-medium text-slate-700">
                        {book.authors[0]}
                        {book.authors.length > 1 ? ' et al.' : ''}
                      </span>
                      <MetadataSeparator />
                      <span>{book.publicationYear}</span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {book.abstract}
                    </p>

                    <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {book.location.floor} · {book.location.shelf}
                      </span>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="bg-slate-50/50">
                  <div className="flex items-center gap-1">
                    {book.formats.map((fmt) => (
                      <FormatBadge key={fmt} format={fmt} />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to="/discover">
                      <Button variant="secondary" size="sm">
                        Reserve
                      </Button>
                    </Link>
                    <Link to={`/navigate?callNumber=${encodeURIComponent(book.location.callNumber)}`}>
                      <Button variant="primary" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
                        Locate
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION 6 — RECENT ACTIVITY */}
        <section aria-labelledby="recent-activity-heading">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80">
            <div>
              <SectionHeading id="recent-activity-heading">
                Recent Activity
              </SectionHeading>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit trail of your checkout transactions, holds, e-reader syncs, and acquisition proposals.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Last updated just now
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 divide-y divide-slate-100 shadow-2xs">
            {mockStudentActivities.map((act) => {
              const iconMap = {
                book_reserved: <BookMarked className="w-4 h-4 text-sky-600" />,
                book_returned: <RotateCcw className="w-4 h-4 text-emerald-600" />,
                digital_opened: <Laptop className="w-4 h-4 text-purple-600" />,
                acquisition_submitted: <FolderPlus className="w-4 h-4 text-amber-600" />,
              };

              return (
                <div 
                  key={act.id} 
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0 mt-0.5 sm:mt-0">
                      {iconMap[act.type]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          {act.badgeLabel}
                        </span>
                        <MetadataSeparator />
                        <span className="font-mono text-xs text-slate-400">
                          {act.timestamp}
                        </span>
                      </div>
                      <h4 className="font-serif text-sm font-medium text-slate-900 mt-0.5">
                        {act.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {act.description}
                      </p>
                    </div>
                  </div>

                  {act.actionUrl && (
                    <div className="sm:self-center shrink-0">
                      {act.actionUrl === '#' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsReaderModalOpen(true)}
                          className="text-xs text-sky-700 hover:text-sky-900"
                        >
                          Resume Reading
                        </Button>
                      ) : (
                        <Link to={act.actionUrl}>
                          <Button variant="ghost" size="sm" className="text-xs text-slate-600 hover:text-slate-900">
                            Details →
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </PageContainer>

      {/* CONTINUOUS READING SIMULATION MODAL (Zero Dead Clicks) */}
      <Modal
        isOpen={isReaderModalOpen}
        onClose={() => setIsReaderModalOpen(false)}
        title={readingItem.title}
        description={`${readingItem.chapter} · ${readingItem.callNumber}`}
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500 font-mono">
              Page {readingItem.currentPage} / {readingItem.totalPages} ({readingItem.progressPercentage}%)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReaderModalOpen(false)}
              >
                Close Reader
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAdvancePage}
              >
                Turn Next Page →
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-serif">
          <div className="p-3 bg-sky-50/70 border border-sky-200/70 rounded-lg text-xs font-sans text-sky-900 flex items-center justify-between">
            <span>Reading state synced with Kite Cloud Bookmark Engine.</span>
            <span className="font-mono text-sky-800 font-semibold">{readingItem.progressPercentage}%</span>
          </div>

          <h3 className="font-serif text-lg font-medium text-slate-900 border-b border-slate-100 pb-2">
            Section 4.3: Self-Balancing Binary Search Trees
          </h3>

          <p>
            An AVL tree is a self-balancing binary search tree in which the heights of the two child subtrees of any node differ by at most one. If at any time they differ by more than one, rebalancing is done to restore this property through tree rotations.
          </p>

          <p>
            Lookup, insertion, and deletion all take O(log n) time in both the average and worst cases, where n is the number of nodes in the tree prior to the operation. Insertions and deletions may require the tree to be rebalanced by one or more tree rotations.
          </p>

          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto">
            {`// Tree Rotation Invariant
typedef struct AVLNode {
    int key;
    struct AVLNode *left;
    struct AVLNode *right;
    int height;
} AVLNode;`}
          </div>

          <p className="text-xs text-slate-500 font-sans italic">
            Press "Turn Next Page" below to simulate reading forward and advancing your synced progress bar on the dashboard.
          </p>
        </div>
      </Modal>
    </div>
  );
};

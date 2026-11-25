import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Copy, 
  CalendarCheck, 
  ArrowLeftRight, 
  Laptop, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Plus, 
  ArrowRight, 
  Building2, 
  RefreshCw, 
  ChevronRight,
  Filter,
  Eye,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { MonospaceCallout } from '../../components/ui/Typography';
import { useToast } from '../../components/ui/Toast';
import { LibraryService } from '../../services/mockLibraryService';
import { PhysicalCopiesService } from '../../data/mockCopiesData';
import { Book, Reservation, AcquisitionRequest, LoanRecord, DetailedBookCopy } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Metrics state
  const [books, setBooks] = useState<Book[]>([]);
  const [copies, setCopies] = useState<DetailedBookCopy[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [acquisitions, setAcquisitions] = useState<AcquisitionRequest[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>('All');

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [fetchedBooks, fetchedReservations, fetchedLoans, fetchedAcquisitions, fetchedActivities] = await Promise.all([
        LibraryService.getBooks({}),
        LibraryService.getReservations(),
        LibraryService.getActiveLoans(),
        LibraryService.getAcquisitions(),
        LibraryService.getRecentActivities(),
      ]);

      const fetchedCopies = PhysicalCopiesService.getAllCopies();

      setBooks(fetchedBooks);
      setReservations(fetchedReservations);
      setLoans(fetchedLoans);
      setAcquisitions(fetchedAcquisitions);
      setActivities(fetchedActivities);
      setCopies(fetchedCopies);
    } catch (e) {
      console.error('Failed to load admin dashboard data', e);
      toast.error('Dashboard Error', 'Unable to retrieve latest operational metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Top Metrics Calculations as requested:
  // 1. Total Books
  const totalBooksCount = books.length;

  // 2. Available Copies
  const availableCopiesCount = copies.filter((c) => c.status === 'Available').length;

  // 3. Borrowed
  const borrowedCount = copies.filter((c) => c.status === 'Borrowed').length || loans.length;

  // 4. Reserved
  const reservedCount = copies.filter((c) => c.status === 'Reserved').length || reservations.filter((r) => r.status === 'active' || r.status === 'ready_for_pickup').length;

  // 5. Digital Resources
  const digitalResourcesCount = books.filter((b) => b.digitalAvailable).length;

  // 6. Pending Acquisition Requests
  const pendingAcquisitionsCount = acquisitions.filter(
    (a) => a.status === 'under_review' || a.status === 'faculty_endorsed' || (a.status as any) === 'requested' || (a.status as any) === 'REQUESTED'
  ).length;

  // Handle advancing reservation status
  const handleAdvanceReservation = async (reservation: Reservation) => {
    let nextStatus: any = 'ready_for_pickup';
    if (reservation.status === 'ready_for_pickup') {
      nextStatus = 'completed';
    }

    const updated = await LibraryService.updateReservationStatus(reservation.id, nextStatus);
    if (updated) {
      toast.success(
        'Reservation Updated',
        `Hold ${reservation.reservationId} is now ${nextStatus.replace(/_/g, ' ').toUpperCase()}.`
      );
      loadDashboardData();
    }
  };

  // Handle advancing acquisition status
  const handleAdvanceAcquisition = async (req: AcquisitionRequest) => {
    let nextStatus: any = 'ordered';
    if (req.status === 'under_review' || (req.status as any) === 'requested') {
      nextStatus = 'ordered';
    } else if (req.status === 'ordered') {
      nextStatus = 'available';
    }

    await LibraryService.updateAcquisitionStatus(req.id, nextStatus);
    toast.success('Acquisition Approved', `Request for "${req.title}" advanced to ${nextStatus.toUpperCase()}.`);
    loadDashboardData();
  };

  // Filtered activities
  const filteredActivities = activityCategoryFilter === 'All'
    ? activities
    : activities.filter((a) => a.category.toLowerCase() === activityCategoryFilter.toLowerCase());

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ===================================================================== */}
      {/* 1. HEADER & OPERATIONAL BAR                                           */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 select-none">
              Central Library Operations
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-xs text-slate-500">Supervisory Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Library Management Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time catalog oversight, stacks inventory, circulation desk queues, and collection acquisition pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadDashboardData}
          >
            Refresh Metrics
          </Button>

          <Link to="/admin/books">
            <Button variant="primary" size="sm" className="text-xs" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Book to Catalog
            </Button>
          </Link>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. TOP METRICS (6 Cards Required)                                     */}
      {/* Total Books, Available Copies, Borrowed, Reserved, Digital Resources, Pending Acquisitions */}
      {/* ===================================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Operational Stacks & Circulation Metrics
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Live Inventory Telemetry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. Total Books */}
          <Link to="/admin/books" className="group">
            <Card className="p-4 bg-white border-slate-200/90 hover:border-sky-400 transition-all shadow-2xs hover:shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span className="font-medium text-slate-600 uppercase tracking-wider text-[11px]">Total Books</span>
                <BookOpen className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                {totalBooksCount}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block group-hover:text-sky-700 transition-colors">
                Cataloged Titles →
              </span>
            </Card>
          </Link>

          {/* 2. Available Copies */}
          <Link to="/admin/copies" className="group">
            <Card className="p-4 bg-white border-slate-200/90 hover:border-emerald-400 transition-all shadow-2xs hover:shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span className="font-medium text-slate-600 uppercase tracking-wider text-[11px]">Available</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">
                {availableCopiesCount}
              </div>
              <span className="text-[11px] text-emerald-600 mt-1 block">
                On physical stacks
              </span>
            </Card>
          </Link>

          {/* 3. Borrowed */}
          <Link to="/admin/borrowing" className="group">
            <Card className="p-4 bg-white border-slate-200/90 hover:border-amber-400 transition-all shadow-2xs hover:shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span className="font-medium text-slate-600 uppercase tracking-wider text-[11px]">Borrowed</span>
                <ArrowLeftRight className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                {borrowedCount}
              </div>
              <span className="text-[11px] text-amber-700 mt-1 block">
                Active patron loans
              </span>
            </Card>
          </Link>

          {/* 4. Reserved */}
          <Link to="/admin/reservations" className="group">
            <Card className="p-4 bg-white border-slate-200/90 hover:border-sky-400 transition-all shadow-2xs hover:shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span className="font-medium text-slate-600 uppercase tracking-wider text-[11px]">Reserved</span>
                <CalendarCheck className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-sky-900">
                {reservedCount}
              </div>
              <span className="text-[11px] text-sky-700 mt-1 block">
                Lockers & hold shelf
              </span>
            </Card>
          </Link>

          {/* 5. Digital Resources */}
          <Link to="/admin/books" className="group">
            <Card className="p-4 bg-white border-slate-200/90 hover:border-indigo-400 transition-all shadow-2xs hover:shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span className="font-medium text-slate-600 uppercase tracking-wider text-[11px]">Digital Access</span>
                <Laptop className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-indigo-950">
                {digitalResourcesCount}
              </div>
              <span className="text-[11px] text-indigo-700 mt-1 block">
                Instant e-reader titles
              </span>
            </Card>
          </Link>

          {/* 6. Pending Acquisition Requests */}
          <Link to="/admin/acquisitions" className="group">
            <Card className="p-4 bg-white border-slate-200/90 hover:border-rose-400 transition-all shadow-2xs hover:shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span className="font-medium text-slate-600 uppercase tracking-wider text-[11px]">Pending Acq.</span>
                <FileText className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-rose-700">
                {pendingAcquisitionsCount}
              </div>
              <span className="text-[11px] text-rose-600 mt-1 block font-medium">
                Under review queue
              </span>
            </Card>
          </Link>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. SECTION: RECENT RESERVATIONS                                       */}
      {/* Columns: Student | Book | Copy | Status | Reserved At | Expiry        */}
      {/* ===================================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-sky-700" />
              <span>Recent Physical Book Reservations</span>
            </h2>
            <p className="text-xs text-slate-500">
              Patron hold orders requiring locker routing, staff shelf pulling, or dispatch verification.
            </p>
          </div>
          <Link to="/admin/reservations">
            <Button variant="outline" size="sm" className="text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              All Reservations Queue ({reservations.length})
            </Button>
          </Link>
        </div>

        <Card className="bg-white border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3.5">Student / Patron</th>
                  <th scope="col" className="px-4 py-3.5">Book Monograph</th>
                  <th scope="col" className="px-4 py-3.5">Physical Copy</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5">Reserved At</th>
                  <th scope="col" className="px-4 py-3.5">Expiry Deadline</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.slice(0, 5).map((res) => {
                  const studentDisplayName = res.studentName || 'Alex Chen';
                  const studentId = res.studentId || 'KIT-2026-4401';
                  const copyDisplay = res.copyId || `CP-${res.shelf}-01`;

                  // Status badge format
                  const isReady = res.status === 'ready_for_pickup';
                  const isActive = res.status === 'active';
                  const isCompleted = res.status === 'completed';
                  const isExpired = res.status === 'expired';

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Column 1: Student */}
                      <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {studentDisplayName[0]}
                          </div>
                          <div>
                            <span className="block font-semibold">{studentDisplayName}</span>
                            <span className="text-[10px] font-mono text-slate-500">{studentId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Book */}
                      <td className="px-4 py-3.5 text-slate-800">
                        <div className="max-w-xs">
                          <span className="font-serif font-medium text-slate-900 block truncate" title={res.bookTitle}>
                            {res.bookTitle}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Call: {res.callNumber} · Shelf {res.shelf}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Copy */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {copyDisplay}
                        </span>
                      </td>

                      {/* Column 4: Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`
                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider
                            ${
                              isReady
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : isActive
                                ? 'bg-sky-50 text-sky-800 border border-sky-300'
                                : isCompleted
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }
                          `}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-emerald-500 animate-pulse' : isActive ? 'bg-sky-500' : isCompleted ? 'bg-slate-400' : 'bg-rose-500'}`} />
                          <span>{res.status.replace(/_/g, ' ')}</span>
                        </span>
                      </td>

                      {/* Column 5: Reserved At */}
                      <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {new Date(res.reservedAt).toLocaleDateString()} {new Date(res.reservedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Column 6: Expiry */}
                      <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        <span className={isExpired ? 'text-rose-600 font-semibold' : ''}>
                          {new Date(res.expiresAt).toLocaleDateString()} {new Date(res.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                        {isActive && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-[11px] h-7 px-2"
                            onClick={() => handleAdvanceReservation(res)}
                          >
                            Mark Ready
                          </Button>
                        )}
                        {isReady && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-[11px] h-7 px-2"
                            onClick={() => handleAdvanceReservation(res)}
                          >
                            Mark Retrieved
                          </Button>
                        )}
                        <Link to={`/reservations/${res.id}`}>
                          <Button variant="ghost" size="sm" className="text-[11px] h-7 px-2 text-slate-600">
                            Slip
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* ===================================================================== */}
      {/* 4. SECTION: RECENT ACQUISITIONS & LIBRARY ACTIVITY (2-Column Grid)    */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* =================================================================== */}
        {/* LEFT 7 COLS: RECENT ACQUISITIONS                                    */}
        {/* Columns: Book | Requester | Department | Status                     */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-700" />
                <span>Recent Acquisition Proposals</span>
              </h2>
              <p className="text-xs text-slate-500">
                Departmental requests for resources not currently held in library stacks.
              </p>
            </div>
            <Link to="/admin/acquisitions">
              <Button variant="outline" size="sm" className="text-xs">
                Pipeline ({acquisitions.length})
              </Button>
            </Link>
          </div>

          <Card className="bg-white border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3.5">Book Monograph</th>
                    <th scope="col" className="px-4 py-3.5">Requester</th>
                    <th scope="col" className="px-4 py-3.5">Department</th>
                    <th scope="col" className="px-4 py-3.5">Status</th>
                    <th scope="col" className="px-4 py-3.5 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {acquisitions.slice(0, 4).map((acq) => {
                    const isUnderReview = acq.status === 'under_review' || (acq.status as any) === 'requested';
                    const isOrdered = acq.status === 'ordered';
                    const isAvailable = acq.status === 'available';

                    return (
                      <tr key={acq.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Book */}
                        <td className="px-4 py-3 text-slate-800">
                          <span className="font-serif font-semibold text-slate-900 block truncate max-w-xs" title={acq.title}>
                            {acq.title}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate block">
                            By {acq.authors}
                          </span>
                        </td>

                        {/* Requester */}
                        <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                          {acq.requestedBy}
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3 text-slate-600 text-[11px] whitespace-nowrap">
                          {acq.department}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`
                              inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                              ${
                                isUnderReview
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : isOrdered
                                  ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                  : isAvailable
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-800'
                              }
                            `}
                          >
                            {acq.status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Review Action */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {isUnderReview ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-[10px] h-6 px-2"
                              onClick={() => handleAdvanceAcquisition(acq)}
                            >
                              Approve
                            </Button>
                          ) : isOrdered ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[10px] h-6 px-2 text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                              onClick={() => handleAdvanceAcquisition(acq)}
                            >
                              Mark In Stacks
                            </Button>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-medium">Ready</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* =================================================================== */}
        {/* RIGHT 5 COLS: LIBRARY ACTIVITY FEED                                 */}
        {/* Simple real-time activity feed                                      */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-700" />
                <span>Library Activity Stream</span>
              </h2>
              <p className="text-xs text-slate-500">Live circulation, stacks, and accession events.</p>
            </div>

            {/* Quick category filter selector */}
            <select
              value={activityCategoryFilter}
              onChange={(e) => setActivityCategoryFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="All">All Events</option>
              <option value="Circulation">Circulation</option>
              <option value="Acquisitions">Acquisitions</option>
              <option value="Stacks">Stacks Inventory</option>
              <option value="Wayfinding">Wayfinding</option>
            </select>
          </div>

          <Card className="p-4 bg-white border-slate-200/90 shadow-2xs divide-y divide-slate-100">
            {filteredActivities.map((act) => {
              return (
                <div key={act.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 leading-snug">
                      {act.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {act.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[10px]">
                    <span className="font-mono text-slate-400">Actor: {act.user}</span>
                    <span className="text-slate-300">·</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {act.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
};

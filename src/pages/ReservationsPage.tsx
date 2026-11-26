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
import { SegmentedControl } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { ReservationModal } from '../components/reservation/ReservationModal';
import { LibraryService } from '../services/mockLibraryService';
import { Reservation, ReservationStatus, Book } from '../types';
import { 
  Key, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  Compass, 
  Calendar, 
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Search,
  Copy,
  Plus,
  RefreshCw,
  XCircle
} from 'lucide-react';

export const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'ready' | 'expired' | 'completed'>('active');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Reserve modal state
  const [quickReserveBook, setQuickReserveBook] = useState<Book | null>(null);
  const [isQuickReserveOpen, setIsQuickReserveOpen] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const loadReservations = async () => {
    setLoading(true);
    const data = await LibraryService.getReservations();
    setReservations(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  // Reservation cancellation
  const handleCancelReservation = async (res: Reservation) => {
    if (window.confirm(`Are you sure you want to cancel the hold for "${res.bookTitle}"?`)) {
      setProcessingId(res.id);
      const success = await LibraryService.cancelReservation(res.id);
      if (success) {
        await loadReservations();
        toast.info('Reservation Cancelled', `Your hold for "${res.bookTitle}" has been cancelled.`);
      } else {
        toast.error('Error', 'Unable to cancel hold. Please try again.');
      }
      setProcessingId(null);
    }
  };

  // Status Change: Mark as Retrieved (Completed)
  const handleMarkCollected = async (res: Reservation) => {
    setProcessingId(res.id);
    const updated = await LibraryService.updateReservationStatus(res.id, 'completed');
    if (updated) {
      await loadReservations();
      toast.success('Monograph Retrieved', `Checked out "${res.bookTitle}". Transferred to your active loans.`);
    }
    setProcessingId(null);
  };

  // Status Change: Simulate Ready for Pickup (Transition from active/queued)
  const handleSimulateReady = async (res: Reservation) => {
    setProcessingId(res.id);
    const updated = await LibraryService.updateReservationStatus(res.id, 'ready_for_pickup');
    if (updated) {
      await loadReservations();
      toast.success(
        'Locker Dispatch Complete',
        `"${res.bookTitle}" is now loaded in ${res.pickupLocation}. Claim token ${res.claimToken} activated!`
      );
    }
    setProcessingId(null);
  };

  // Status Change: Re-activate expired/cancelled hold
  const handleReactivateHold = async (res: Reservation) => {
    setProcessingId(res.id);
    const updated = await LibraryService.updateReservationStatus(res.id, 'ready_for_pickup');
    if (updated) {
      await loadReservations();
      toast.success('Hold Restored', `Re-activated hold token ${res.claimToken} for "${res.bookTitle}".`);
    }
    setProcessingId(null);
  };

  const handleCopyClaimToken = (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(token);
    toast.info('Passcode Copied', `Claim Token ${token} copied to clipboard.`);
  };

  const handleOpenQuickReserve = async () => {
    // Default to Operating System Concepts or first available book
    const osBook = await LibraryService.getBookById('bk-cs-04') || await LibraryService.getBookById('bk-cs-01');
    if (osBook) {
      setQuickReserveBook(osBook);
      setIsQuickReserveOpen(true);
    } else {
      navigate('/discover');
    }
  };

  // Filter reservations into the 4 primary categories
  const activeList = reservations.filter(
    (r) => r.status === 'active' || r.status === 'queued' || r.status === 'in_transit'
  );
  const readyList = reservations.filter((r) => r.status === 'ready_for_pickup');
  const expiredList = reservations.filter((r) => r.status === 'expired');
  const completedList = reservations.filter((r) => r.status === 'completed' || r.status === 'cancelled');

  const tabLists = {
    active: activeList,
    ready: readyList,
    expired: expiredList,
    completed: completedList,
  };

  let displayedList = tabLists[activeTab];

  // Optional search filter across title, author, claim token, and ID
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    displayedList = displayedList.filter(
      (r) =>
        r.bookTitle.toLowerCase().includes(q) ||
        r.claimToken.toLowerCase().includes(q) ||
        r.reservationId.toLowerCase().includes(q) ||
        r.pickupLocation.toLowerCase().includes(q) ||
        (r.bookAuthor && r.bookAuthor.toLowerCase().includes(q))
    );
  }

  return (
    <PageContainer
      maxWidth="standard"
      header={
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 select-none">
              Smart Hold & Stacks Retrieval
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-xs text-slate-500">24/7 Automated Campus Lockers</span>
          </div>
          <PageHeading>My Library Reservations</PageHeading>
          <Subheading className="mt-1">
            Track real-time hold statuses, retrieve physical claim tokens, and manage pickup deadlines.
          </Subheading>
        </div>
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4 text-sky-600" />}
            onClick={handleOpenQuickReserve}
          >
            Quick Hold Test
          </Button>

          <Link to="/discover">
            <Button variant="primary" size="sm" leftIcon={<Search className="w-4 h-4" />}>
              Find & Reserve Monograph
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ================================================================ */}
        {/* TAB CONTROLS: Active | Ready for Pickup | Expired | Completed    */}
        {/* ================================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <SegmentedControl
            value={activeTab}
            onChange={(val) => setActiveTab(val as any)}
            options={[
              { label: 'Active', value: 'active', count: activeList.length },
              { label: 'Ready for Pickup', value: 'ready', count: readyList.length },
              { label: 'Expired', value: 'expired', count: expiredList.length },
              { label: 'Completed', value: 'completed', count: completedList.length },
            ]}
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Filter by title, token, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-auto h-11 md:h-8 px-2.5 pl-8 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="md:h-8 text-xs text-slate-500 hover:text-slate-900"
              onClick={loadReservations}
              title="Refresh holdings from service"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* RESERVATIONS GRID                                                */}
        {/* ================================================================ */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            Retrieving patron reservation vouchers...
          </div>
        ) : displayedList.length === 0 ? (
          <EmptyState
            title={`No ${activeTab.replace(/_/g, ' ')} reservations`}
            description={
              activeTab === 'ready'
                ? 'You do not have any monographs currently awaiting pickup in smart lockers or circulation desks.'
                : activeTab === 'active'
                ? 'No active processing hold requests currently in queue.'
                : activeTab === 'expired'
                ? 'No expired reservations found in your history.'
                : 'No completed or cancelled reservations recorded.'
            }
            actionLabel="Browse Catalog to Place Hold"
            onAction={() => navigate('/discover')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {displayedList.map((res) => {
              const isReady = res.status === 'ready_for_pickup';
              const isActive = res.status === 'active' || res.status === 'queued' || res.status === 'in_transit';
              const isExpired = res.status === 'expired';
              const isCompleted = res.status === 'completed';
              const isCancelled = res.status === 'cancelled';

              return (
                <Card
                  key={res.id}
                  className={`flex flex-col justify-between transition-all duration-200 ${
                    isReady
                      ? 'border-emerald-300 bg-white ring-1 ring-emerald-100 shadow-xs'
                      : isExpired
                      ? 'border-rose-200 bg-rose-50/20'
                      : 'bg-white'
                  }`}
                >
                  <div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
                            isReady
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isExpired
                              ? 'bg-rose-100 text-rose-900 border border-rose-200'
                              : isCompleted
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : isCancelled
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : 'bg-sky-100 text-sky-900 border border-sky-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isReady
                                ? 'bg-emerald-600 ring-2 ring-emerald-300 animate-pulse'
                                : isExpired
                                ? 'bg-rose-500'
                                : isCompleted
                                ? 'bg-slate-400'
                                : 'bg-sky-500'
                            }`}
                          />
                          <span>{res.status.replace(/_/g, ' ')}</span>
                        </span>

                        <MonospaceCallout>{res.callNumber}</MonospaceCallout>
                      </div>

                      {/* Book Title & Author */}
                      <CardTitle className="text-lg">
                        <Link
                          to={`/reservations/${res.id}`}
                          className="hover:text-sky-800 transition-colors"
                        >
                          {res.bookTitle}
                        </Link>
                      </CardTitle>

                      <p className="text-xs text-slate-500 mt-0.5">
                        By {res.bookAuthor || res.bookAuthors.join(', ')}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Prominent Claim Token Card */}
                      <div className="p-3.5 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                            Claim Token
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-emerald-300 select-all">
                              {res.claimToken}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyClaimToken(res.claimToken, e)}
                              className="min-w-[40px] min-h-[40px] md:min-w-0 md:min-h-0 flex items-center justify-center text-slate-400 hover:text-white transition-colors p-2 md:p-1 rounded hover:bg-white/10"
                              title="Copy Claim Token"
                              aria-label="Copy Claim Token"
                            >
                              <Copy className="w-4 h-4 md:w-3.5 md:h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                            Reservation ID
                          </span>
                          <span className="font-mono text-xs text-sky-200">
                            {res.reservationId}
                          </span>
                        </div>
                      </div>

                      {/* Pickup Location & Stacks Shelf Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[11px] text-slate-400 block uppercase">
                            Pickup Location
                          </span>
                          <span className="font-medium text-slate-900 block mt-0.5 truncate" title={res.pickupLocation}>
                            {res.pickupLocation}
                          </span>
                          {res.pickupLocker && (
                            <span className="text-[11px] font-mono text-emerald-800 block mt-0.5">
                              {res.pickupLocker}
                            </span>
                          )}
                        </div>

                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[11px] text-slate-400 block uppercase">
                            Stacks Shelf
                          </span>
                          <span className="font-mono font-bold text-sky-800 block mt-0.5">
                            {res.shelf}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5 truncate">
                            {res.library}
                          </span>
                        </div>
                      </div>

                      {/* Reserved Date & Expiry */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Reserved: {new Date(res.reservedAt).toLocaleDateString()}</span>
                        </span>

                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Expires: {new Date(res.expiresAt).toLocaleDateString()} (22:00)</span>
                        </span>
                      </div>
                    </CardContent>
                  </div>

                  {/* Card Actions Footer */}
                  <CardFooter className="bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <Link
                      to={`/navigate?callNumber=${encodeURIComponent(res.callNumber)}`}
                      className="text-xs font-medium text-sky-700 hover:text-sky-900 flex items-center gap-1"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>View Shelf Wayfinding</span>
                    </Link>

                    <div className="flex items-center flex-wrap gap-2">
                      <Link to={`/reservations/${res.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Claim Slip
                        </Button>
                      </Link>

                      {/* Status Lifecycle Action Triggers */}
                      {isReady && (
                        <Button
                          variant="accent"
                          size="sm"
                          className="text-xs h-8"
                          isLoading={processingId === res.id}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          onClick={() => handleMarkCollected(res)}
                        >
                          Mark as Retrieved
                        </Button>
                      )}

                      {isActive && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs h-8"
                          isLoading={processingId === res.id}
                          leftIcon={<Sparkles className="w-3.5 h-3.5 text-sky-600" />}
                          onClick={() => handleSimulateReady(res)}
                          title="Simulate automated locker dispatch for testing"
                        >
                          Simulate Ready
                        </Button>
                      )}

                      {(isActive || isReady) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          isLoading={processingId === res.id}
                          onClick={() => handleCancelReservation(res)}
                        >
                          Cancel Hold
                        </Button>
                      )}

                      {(isExpired || isCancelled) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs h-8"
                          isLoading={processingId === res.id}
                          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                          onClick={() => handleReactivateHold(res)}
                        >
                          Re-activate Hold
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Reserve Modal */}
      {quickReserveBook && (
        <ReservationModal
          isOpen={isQuickReserveOpen}
          onClose={() => setIsQuickReserveOpen(false)}
          book={quickReserveBook}
          onSuccess={() => {
            loadReservations();
          }}
        />
      )}
    </PageContainer>
  );
};

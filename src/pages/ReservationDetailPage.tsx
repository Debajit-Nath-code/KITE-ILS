import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { LibraryService } from '../services/mockLibraryService';
import { Reservation } from '../types';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Key, 
  MapPin, 
  Compass, 
  Building2, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle,
  Copy,
  Printer,
  Sparkles
} from 'lucide-react';

export const ReservationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    if (id) {
      setLoading(true);
      LibraryService.getReservationById(id).then((found) => {
        if (!isCurrent) return;
        setReservation(found || null);
        setLoading(false);
      });
    }
    return () => {
      isCurrent = false;
    };
  }, [id]);

  const handleCancel = async () => {
    if (!reservation) return;
    if (window.confirm(`Are you sure you want to cancel your hold for "${reservation.bookTitle}"?`)) {
      setIsProcessing(true);
      await LibraryService.cancelReservation(reservation.id);
      setIsProcessing(false);
      setReservation((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
      toast.info('Reservation Cancelled', `Your reservation for "${reservation.bookTitle}" has been cancelled. Copy returned to shelf.`);
    }
  };

  const handleMarkCollected = async () => {
    if (!reservation) return;
    setIsProcessing(true);
    const updated = await LibraryService.updateReservationStatus(reservation.id, 'completed');
    setIsProcessing(false);
    if (updated) {
      setReservation(updated);
      toast.success('Monograph Retrieved', `Physical checkout recorded for ${reservation.bookTitle}.`);
    }
  };

  if (loading) {
    return (
      <PageContainer maxWidth="standard" className="py-12">
        <div className="text-center py-16 text-slate-500 text-sm">
          Loading reservation slip...
        </div>
      </PageContainer>
    );
  }

  if (!reservation) {
    return (
      <PageContainer maxWidth="standard" className="py-12">
        <EmptyState
          title="Reservation Record Not Found"
          description={`Unable to locate reservation identifier or claim token "${id}".`}
          actionLabel="View All Reservations"
          onAction={() => navigate('/reservations')}
        />
      </PageContainer>
    );
  }

  const isReady = reservation.status === 'ready_for_pickup';
  const isActive = reservation.status === 'active' || reservation.status === 'ready_for_pickup';

  return (
    <div className="flex-1 bg-slate-50 pb-16">
      {/* Top Breadcrumb */}
      <section className="bg-white border-b border-slate-200/80 py-3.5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
          <Link
            to="/reservations"
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Back to My Reservations</span>
          </Link>
          <span className="font-mono text-slate-500">ID: {reservation.reservationId}</span>
        </div>
      </section>

      <PageContainer maxWidth="narrow" className="pt-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Kicker>University Stacks Retrieval Voucher</Kicker>
            <PageHeading>
              Reservation {reservation.reservationId}
            </PageHeading>
            <Subheading className="mt-0.5">
              Authorized patron hold token for academic collection retrieval.
            </Subheading>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => window.print()}
            >
              Print Pass
            </Button>
          </div>
        </div>

        {/* High-Contrast Digital Retrieval Voucher */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-6 select-none">
          {/* Top Token Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Official Claim Token
              </span>
              <span className="font-mono text-3xl sm:text-4xl font-bold tracking-wider text-emerald-400 block mt-0.5 select-all">
                {reservation.claimToken}
              </span>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Current Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold uppercase mt-1 ${
                  isReady
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : reservation.status === 'completed'
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>{reservation.status.replace(/_/g, ' ')}</span>
              </span>
            </div>
          </div>

          {/* Book Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                Monograph Title
              </span>
              <h3 className="font-serif text-lg font-medium text-white mt-1 leading-snug">
                {reservation.bookTitle}
              </h3>
              <p className="text-slate-300 text-xs mt-0.5">
                {reservation.bookAuthor || reservation.bookAuthors.join(', ')}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Designated Pickup Location
                </span>
                <span className="text-white font-medium text-sm block mt-0.5">
                  {reservation.pickupLocation}
                </span>
                {reservation.pickupLocker && (
                  <span className="text-emerald-300 font-mono text-xs block mt-0.5">
                    {reservation.pickupLocker}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Library Stacks Shelf
                </span>
                <span className="font-mono text-sky-300 font-semibold text-sm">
                  {reservation.shelf}
                </span>
                <span className="text-slate-400 font-mono text-[11px] block">
                  Call: {reservation.callNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Simulated Optical RFID Barcode Banner */}
          <div className="pt-4 border-t border-white/10 flex flex-col items-center justify-center space-y-2 text-center">
            {/* Barcode lines graphic */}
            <div className="w-full max-w-sm h-12 bg-white rounded p-1.5 flex items-center justify-center gap-1 opacity-90 overflow-hidden">
              {[4, 2, 6, 3, 2, 5, 2, 4, 3, 6, 2, 5, 3, 4, 2, 6, 3, 2, 4, 5, 2, 3, 6, 2, 4, 3, 5, 2].map((w, idx) => (
                <div key={idx} className="h-full bg-slate-950" style={{ width: `${w * 2}px` }} />
              ))}
            </div>
            <span className="font-mono text-[11px] text-slate-400 tracking-widest">
              *{reservation.reservationId}-{reservation.claimToken}*
            </span>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <Card className="p-6 bg-white space-y-4">
          <SectionHeading className="text-sm">
            Hold Actions & Retrieval Guidance
          </SectionHeading>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to={`/navigate/${reservation.shelf?.match(/(CS|PHY|MAT|ENG|BIO|LIT|ECO|CIV|REF|ARC)-[0-9]{3}/i)?.[0] || 'CS-204'}?title=${encodeURIComponent(reservation.bookTitle)}`}
              className="block"
            >
              <Button
                variant="primary"
                size="md"
                className="w-full text-xs"
                leftIcon={<Compass className="w-4 h-4" />}
              >
                Navigate to Shelf / Locker
              </Button>
            </Link>

            {isReady && (
              <Button
                variant="secondary"
                size="md"
                className="w-full text-xs"
                isLoading={isProcessing}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                onClick={handleMarkCollected}
              >
                Mark as Retrieved (Simulate)
              </Button>
            )}

            {isActive && reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
              <Button
                variant="outline"
                size="md"
                className="w-full text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                isLoading={isProcessing}
                onClick={handleCancel}
              >
                Cancel Reservation Hold
              </Button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Hold registered: {new Date(reservation.reservedAt).toLocaleDateString()}</span>
            <span>
              Expires: <strong>{new Date(reservation.expiresAt).toLocaleDateString()}</strong>
            </span>
          </div>
        </Card>
      </PageContainer>
    </div>
  );
};

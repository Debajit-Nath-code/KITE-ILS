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
import { Book, PhysicalBookCopy, Reservation } from '../types';
import { 
  ArrowLeft, 
  BookMarked, 
  Compass, 
  CheckCircle2, 
  Clock, 
  Building2, 
  MapPin, 
  Key, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const ReserveBookPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [copies, setCopies] = useState<PhysicalBookCopy[]>([]);
  const [selectedCopyId, setSelectedCopyId] = useState<string>('');
  const [pickupLocation, setPickupLocation] = useState('Central Library · Smart Locker 14-B');
  const [duration, setDuration] = useState('48 hours from dispatch');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmed reservation result state
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (bookId) {
      setLoading(true);
      LibraryService.getBookById(bookId).then((found) => {
        if (!isMounted) return;
        if (found) {
          setBook(found);
          const allCopies = LibraryService.getBookCopies(found);
          setCopies(allCopies);
          const firstAvailable = allCopies.find((c) => c.status === 'Available') || allCopies[0];
          if (firstAvailable) {
            setSelectedCopyId(firstAvailable.copyId);
          }
        } else {
          setBook(null);
        }
        setLoading(false);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [bookId]);

  const handleConfirmReservation = async () => {
    if (!book) return;
    setIsSubmitting(true);

    try {
      const created = await LibraryService.createReservation({
        bookId: book.id,
        pickupLocation,
        copyId: selectedCopyId,
        duration,
      });

      setIsSubmitting(false);
      setConfirmedReservation(created);
      if (book.availableCopies === 0) {
        toast.warning(
          'Book Unavailable',
          `All physical copies of "${book.title}" are currently in circulation. You have been placed in queue position #1.`
        );
      }
      toast.success(
        'Reservation Confirmed ✅',
        `Hold token ${created.claimToken} generated for ${created.bookTitle}. Ready for pickup.`
      );
    } catch {
      setIsSubmitting(false);
      toast.error('Reservation Error', 'Unable to record hold request. Please try again.');
    }
  };

  if (loading) {
    return (
      <PageContainer maxWidth="standard" className="py-12">
        <div className="text-center py-16 text-slate-500 text-sm">
          Loading reservation options...
        </div>
      </PageContainer>
    );
  }

  if (!book) {
    return (
      <PageContainer maxWidth="standard" className="py-12">
        <EmptyState
          title="Monograph Not Found"
          description="The requested volume could not be located in the catalog to initialize a hold."
          actionLabel="Back to Discovery"
          onAction={() => navigate('/discover')}
        />
      </PageContainer>
    );
  }

  const selectedCopy = copies.find((c) => c.copyId === selectedCopyId) || copies[0];
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="flex-1 bg-slate-50 pb-16">
      {/* Top Breadcrumb */}
      <section className="bg-white border-b border-slate-200/80 py-3.5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
          <Link
            to={`/book/${book.id}`}
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Back to Monograph Details</span>
          </Link>
          <span className="font-mono text-slate-500">{book.location.callNumber}</span>
        </div>
      </section>

      <PageContainer maxWidth="narrow" className="pt-8">
        {!confirmedReservation ? (
          /* ================================================================ */
          /* STEP 1: REVIEW & CONFIRM RESERVATION FORM                        */
          /* ================================================================ */
          <div className="space-y-6">
            <div>
              <Kicker>Smart Reservation Protocol</Kicker>
              <PageHeading>
                {isAvailable ? 'Reserve Physical Monograph' : 'Join Reservation Waitlist'}
              </PageHeading>
              <Subheading className="mt-1">
                Select your designated campus retrieval locker or service desk.
              </Subheading>
            </div>

            {/* Monograph Summary Card */}
            <Card className="p-5 bg-white border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 block mb-1">
                    Selected Academic Volume
                  </span>
                  <h3 className="font-serif text-xl font-medium text-slate-900 leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    By {book.author} · {book.publisher} ({book.publicationYear})
                  </p>
                </div>
                <MonospaceCallout>{book.location.callNumber}</MonospaceCallout>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-400 block uppercase">Department</span>
                  <span className="font-medium text-slate-900 mt-0.5 block">{book.department}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-400 block uppercase">Available Copies</span>
                  <span className={`font-semibold mt-0.5 block ${isAvailable ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {book.availableCopies} of {book.totalCopies} on shelf
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-400 block uppercase">Physical Stacks</span>
                  <span className="font-medium text-slate-900 mt-0.5 block truncate">
                    {book.location.shelf}
                  </span>
                </div>
              </div>
            </Card>

            {/* Reservation Configuration Form */}
            <Card className="p-6 bg-white space-y-5">
              <SectionHeading className="text-base border-b border-slate-100 pb-3">
                Retrieval & Allocation Options
              </SectionHeading>

              {/* 1. Available Physical Copy Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                  Select Physical Copy
                </label>
                <div className="space-y-2">
                  {copies.map((copy) => {
                    const isSelectable = copy.status === 'Available' || !isAvailable;
                    return (
                      <label
                        key={copy.copyId}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border text-xs cursor-pointer transition-colors
                          ${
                            selectedCopyId === copy.copyId
                              ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-200'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }
                          ${!isSelectable ? 'opacity-60' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="copySelection"
                            value={copy.copyId}
                            checked={selectedCopyId === copy.copyId}
                            onChange={() => setSelectedCopyId(copy.copyId)}
                            className="text-sky-600 focus:ring-sky-500"
                          />
                          <div>
                            <span className="font-mono font-semibold text-slate-900 block">
                              {copy.copyId}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Barcode: {copy.barcode} · Condition: {copy.condition}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`font-medium px-2 py-0.5 rounded text-[11px] ${
                            copy.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {copy.status}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. Campus Pickup Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                  Designated Pickup Location
                </label>
                <select
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full h-11 px-3 bg-white text-slate-900 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  <option value="Central Library · Smart Locker 14-B">Central Library · 24/7 Smart Locker 14-B (Recommended)</option>
                  <option value="Central Library · Main Circulation Desk">Central Library · Main Circulation Desk</option>
                  <option value="Science & Engineering Library · Locker Bay 03">Science & Engineering Library · Locker Bay 03</option>
                  <option value="Wren Pavilion · Architecture Retrieval Bay">Wren Pavilion · Architecture Retrieval Bay</option>
                  <option value="Old Quad · South Hall Ground Chute">Old Quad · South Hall Ground Chute</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Climate-controlled automated lockers are accessible 24/7 using your university smart card or claim passcode.
                </p>
              </div>

              {/* 3. Hold Duration */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                  Hold Duration Window
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: '48 Hours from Dispatch', value: '48 hours from dispatch' },
                    { label: '5 Days Extended Hold', value: '5 days hold' },
                  ].map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDuration(d.value)}
                      className={`
                        p-3 rounded-lg border text-left text-xs font-medium transition-colors
                        ${
                          duration === d.value
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }
                      `}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <Link to={`/book/${book.id}`}>
                  <Button variant="ghost" size="md">
                    Cancel
                  </Button>
                </Link>

                <Button
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  leftIcon={<BookMarked className="w-4 h-4" />}
                  onClick={handleConfirmReservation}
                >
                  Confirm Reservation
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          /* ================================================================ */
          /* STEP 2: RESERVATION CONFIRMED ✅ SUCCESS SCREEN                   */
          /* ================================================================ */
          <div className="space-y-6 animate-in fade-in duration-200">
            <Card className="p-6 sm:p-8 bg-white border-emerald-300 shadow-md space-y-6">
              {/* Header Banner */}
              <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center shrink-0 ring-4 ring-emerald-50">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 block">
                    Kite ILS Automated Hold
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
                    Reservation Confirmed ✅
                  </h2>
                </div>
              </div>

              {/* Generated Claim Voucher Card */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl space-y-4 shadow-sm select-none">
                <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">
                      Reservation ID
                    </span>
                    <span className="font-mono text-sm text-sky-300 font-bold select-all">
                      {confirmedReservation.reservationId}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">
                      Status
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold uppercase">
                      Ready for Pickup
                    </span>
                  </div>
                </div>

                {/* Primary Claim Token Display */}
                <div className="py-2 text-center bg-white/5 rounded-lg border border-white/10">
                  <span className="text-[11px] text-slate-400 uppercase tracking-widest font-mono block">
                    Claim Token Passcode
                  </span>
                  <span className="font-mono text-3xl sm:text-4xl text-white font-bold tracking-wider select-all block mt-1 text-emerald-300">
                    {confirmedReservation.claimToken}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Present at locker terminal or circulation counter
                  </span>
                </div>

                {/* Reservation Key Fields List */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">
                      Book
                    </span>
                    <span className="font-serif font-medium text-slate-200 block truncate">
                      {confirmedReservation.bookTitle}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">
                      Pickup
                    </span>
                    <span className="font-medium text-slate-200 block truncate">
                      {confirmedReservation.pickupLocation.split('·')[0].trim()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">
                      Shelf
                    </span>
                    <span className="font-mono font-semibold text-sky-300 block">
                      {confirmedReservation.shelf}
                    </span>
                  </div>
                </div>
              </div>

              {/* Retrieval Guidance Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <span>How to Retrieve Your Book:</span>
                </div>
                <p className="leading-relaxed">
                  Head to <strong>{confirmedReservation.pickupLocation}</strong>. Enter your claim passcode{' '}
                  <strong className="font-mono text-slate-900 bg-slate-200 px-1 py-0.5 rounded">{confirmedReservation.claimToken}</strong> on the locker touch screen or present your digital card at the desk.
                </p>
                <p className="text-[11px] text-slate-400">
                  Hold window expires on {new Date(confirmedReservation.expiresAt).toLocaleDateString()} at 22:00.
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  to={`/navigate/${confirmedReservation.shelf?.match(/(CS|PHY|MAT|ENG|BIO|LIT|ECO|CIV|REF|ARC)-[0-9]{3}/i)?.[0] || 'CS-204'}?title=${encodeURIComponent(confirmedReservation.bookTitle)}`}
                  className="w-full sm:w-1/2"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full text-xs"
                    leftIcon={<Compass className="w-4 h-4" />}
                  >
                    View Navigation
                  </Button>
                </Link>

                <Link to="/reservations" className="w-full sm:w-1/2">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full text-xs"
                    leftIcon={<BookMarked className="w-4 h-4" />}
                  >
                    View My Reservations
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

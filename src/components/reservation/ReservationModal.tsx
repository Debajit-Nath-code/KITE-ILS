import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { MonospaceCallout } from '../ui/Typography';
import { useToast } from '../ui/Toast';
import { LibraryService } from '../../services/mockLibraryService';
import { getShelfIdForBook } from '../../data/wayfindingData';
import { Book, PhysicalBookCopy, Reservation } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2, 
  BookMarked, 
  Compass, 
  Key, 
  Copy, 
  Layers, 
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onSuccess?: (reservation: Reservation) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  book,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<'form' | 'confirmed'>('form');
  const [copies, setCopies] = useState<PhysicalBookCopy[]>([]);
  const [selectedCopyId, setSelectedCopyId] = useState<string>('');
  const [pickupLocation, setPickupLocation] = useState<string>('Central Library · Smart Locker 14-B');
  const [duration, setDuration] = useState<string>('48 hours from dispatch');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  // Initialize state when book changes
  useEffect(() => {
    if (book) {
      setStep('form');
      setConfirmedReservation(null);
      const bookCopies = LibraryService.getBookCopies(book);
      setCopies(bookCopies);

      const firstAvailable = bookCopies.find((c) => c.status === 'Available') || bookCopies[0];
      if (firstAvailable) {
        setSelectedCopyId(firstAvailable.copyId);
      }

      // Default pickup location based on library
      if (book.location.library.includes('Central')) {
        setPickupLocation('Central Library · Smart Locker 14-B');
      } else if (book.location.library.includes('Science')) {
        setPickupLocation('Science & Engineering Library · Locker Bay 03');
      } else {
        setPickupLocation('Central Library · Smart Locker 14-B');
      }
    }
  }, [book, isOpen]);

  if (!book) return null;

  const handleConfirmReservation = async () => {
    setIsSubmitting(true);
    try {
      const reservation = await LibraryService.createReservation({
        bookId: book.id,
        pickupLocation,
        copyId: selectedCopyId,
        duration,
      });

      setIsSubmitting(false);
      setConfirmedReservation(reservation);
      setStep('confirmed');

      if (onSuccess) {
        onSuccess(reservation);
      }

      if (book.availableCopies === 0) {
        toast.warning(
          'Book Unavailable',
          `All physical copies of "${book.title}" are currently in circulation. You have been placed in queue position #1.`
        );
      }

      toast.success(
        'Reservation Confirmed ✅',
        `Hold token ${reservation.claimToken} ready for ${book.title}.`
      );
    } catch {
      setIsSubmitting(false);
      toast.error('Reservation Error', 'Unable to complete reservation request. Please try again.');
    }
  };

  const handleCopyClaimToken = () => {
    if (confirmedReservation?.claimToken) {
      navigator.clipboard?.writeText(confirmedReservation.claimToken);
      toast.info('Token Copied', `Claim Token ${confirmedReservation.claimToken} copied to clipboard.`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'form' ? 'Reserve Physical Monograph' : 'Reservation Confirmed ✅'}
      description={
        step === 'form'
          ? `Verify hold details and pickup routing for "${book.title}".`
          : `Your physical monograph hold has been registered and is ready for retrieval.`
      }
      maxWidth="md"
      footer={
        step === 'form' ? (
          <>
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<BookMarked className="w-4 h-4" />}
              onClick={handleConfirmReservation}
            >
              Confirm Reservation
            </Button>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <Button
              variant="secondary"
              size="sm"
              className="w-full sm:w-1/2 text-xs"
              leftIcon={<Compass className="w-4 h-4 text-slate-700" />}
              onClick={() => {
                onClose();
                const shelf = confirmedReservation?.shelf || book.location.shelf;
                const shelfCode = shelf?.match(/(CS|PHY|MAT|ENG|BIO|LIT)-[0-9]{3}/i)?.[0] || getShelfIdForBook(book);
                const title = confirmedReservation?.bookTitle || book.title;
                navigate(`/navigate/${shelfCode}?title=${encodeURIComponent(title)}&bookId=${encodeURIComponent(book.id)}`);
              }}
            >
              View Navigation
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-1/2 text-xs"
              leftIcon={<BookMarked className="w-4 h-4" />}
              onClick={() => {
                onClose();
                navigate('/reservations');
              }}
            >
              View My Reservations
            </Button>
          </div>
        )
      }
    >
      {step === 'form' ? (
        /* ==================================================================== */
        /* STEP 1: RESERVATION CONFIRMATION FORM                                */
        /* ==================================================================== */
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Monograph Review Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-700 block">
                  Book
                </span>
                <h4 className="font-serif text-base font-semibold text-slate-900 mt-0.5">
                  {book.title}
                </h4>
              </div>
              <MonospaceCallout>{book.location.callNumber}</MonospaceCallout>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">Author</span>
                <span className="font-medium text-slate-800">{book.author}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">Library</span>
                <span className="font-medium text-slate-800">{book.location.library}</span>
              </div>
            </div>
          </div>

          {/* Available Physical Copy */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
              Available Copy
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {copies.map((copy) => {
                const isAvail = copy.status === 'Available';
                return (
                  <label
                    key={copy.copyId}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selectedCopyId === copy.copyId
                        ? 'border-sky-500 bg-sky-50/60 ring-1 ring-sky-200'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="modalCopyRadio"
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
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        isAvail
                          ? 'bg-emerald-100 text-emerald-800'
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

          {/* Pickup Location Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
              Pickup Location
            </label>
            <select
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full h-10 px-3 bg-white text-slate-900 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="Central Library · Smart Locker 14-B">Central Library · Smart Locker 14-B (24/7)</option>
              <option value="Central Library · Main Circulation Desk">Central Library · Main Circulation Desk</option>
              <option value="Science & Engineering Library · Locker Bay 03">Science & Engineering Library · Locker Bay 03</option>
              <option value="Wren Pavilion · Architecture Retrieval Bay">Wren Pavilion · Architecture Retrieval Bay</option>
              <option value="Old Quad · South Hall Ground Desk">Old Quad · South Hall Ground Desk</option>
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Automated smart lockers allow frictionless collection 24/7 with your claim token.
            </span>
          </div>

          {/* Reservation Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
              Reservation Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '48 Hours from Dispatch', value: '48 hours from dispatch' },
                { label: '5 Days Extended Hold', value: '5 days hold' },
              ].map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDuration(d.value)}
                  className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-colors ${
                    duration === d.value
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* STEP 2: RESERVATION CONFIRMED ✅ SUCCESS SUMMARY                     */
        /* ==================================================================== */
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Header Banner */}
          <div className="flex items-center gap-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-emerald-900 block text-sm">
                Reservation Confirmed ✅
              </span>
              <span className="text-[11px] text-emerald-800">
                Status: <strong className="font-semibold uppercase">READY FOR PICKUP</strong>
              </span>
            </div>
          </div>

          {/* Prominent High-Contrast Voucher Card */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3.5 shadow-sm border border-slate-800">
            {/* Claim Token Highlight */}
            <div className="p-3 bg-white/10 rounded-lg text-center border border-white/15 relative">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 block">
                Claim Token Passcode
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-emerald-300 block my-0.5 select-all">
                {confirmedReservation?.claimToken || 'KITE-4821'}
              </span>
              <button
                type="button"
                onClick={handleCopyClaimToken}
                className="inline-flex items-center gap-1 text-[11px] text-sky-300 hover:text-sky-200 mt-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Token</span>
              </button>
            </div>

            {/* Core Verification Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Book</span>
                <span className="font-serif font-medium text-white block mt-0.5 truncate" title={confirmedReservation?.bookTitle}>
                  {confirmedReservation?.bookTitle || book.title}
                </span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Pickup</span>
                <span className="font-medium text-white block mt-0.5 truncate">
                  {confirmedReservation?.pickupLocation.split('·')[0].trim() || 'Central Library'}
                </span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Shelf</span>
                <span className="font-mono font-bold text-sky-300 block mt-0.5">
                  {confirmedReservation?.shelf || book.location.shelf}
                </span>
              </div>
            </div>

            {/* Reservation ID & Expiry Footer */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>ID: <strong className="text-white">{confirmedReservation?.reservationId || 'KIT-28492'}</strong></span>
              <span>Expires in: 48 hours</span>
            </div>
          </div>

          {/* Retrieval instructions */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-900">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <span>Next Steps:</span>
            </div>
            <p className="leading-relaxed">
              Proceed to <strong>{confirmedReservation?.pickupLocation || 'Central Library'}</strong>.
              Enter claim passcode <strong className="font-mono text-slate-900 bg-slate-200 px-1 py-0.5 rounded">{confirmedReservation?.claimToken || 'KITE-4821'}</strong> at the locker touchscreen.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};

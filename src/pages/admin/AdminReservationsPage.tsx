import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Compass, 
  Building2, 
  ArrowRight,
  Filter,
  Check,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { LibraryService } from '../../services/mockLibraryService';
import { Reservation, ReservationStatus } from '../../types';

export const AdminReservationsPage: React.FC = () => {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadReservations = async () => {
    const data = await LibraryService.getReservations();
    setReservations(data);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    await LibraryService.updateReservationStatus(id, status);
    toast.success('Reservation Updated', `Status changed to ${status.replace(/_/g, ' ').toUpperCase()}.`);
    loadReservations();
  };

  const filtered = reservations.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      r.bookTitle.toLowerCase().includes(q) ||
      r.reservationId.toLowerCase().includes(q) ||
      r.claimToken.toLowerCase().includes(q) ||
      (r.studentName && r.studentName.toLowerCase().includes(q));

    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 select-none">
              Circulation Queue
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-xs text-slate-500">Hold Pull List & Locker Routing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Patron Reservations & Locker Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage automated locker dispatches, hold shelf sorting, and student claim passcode validations.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadReservations} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Queue
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4 bg-white border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, token (KITE-4821), ID..."
            className="w-full h-9 px-3 pl-9 bg-slate-50 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'ready_for_pickup', 'active', 'completed', 'expired'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filterStatus === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Reservation ID</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Book Monograph</th>
                <th className="px-4 py-3">Pickup Location</th>
                <th className="px-4 py-3">Claim Passcode</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Librarian Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.reservationId}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.studentName || 'Alex Chen'}</td>
                  <td className="px-4 py-3 text-slate-900">
                    <span className="font-serif font-semibold block">{r.bookTitle}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Shelf: {r.shelf}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.pickupLocation}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {r.claimToken}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[10px] uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {r.status === 'active' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[10px] h-6 px-2"
                        onClick={() => handleUpdateStatus(r.id, 'ready_for_pickup')}
                      >
                        Dispatch Locker
                      </Button>
                    )}
                    {r.status === 'ready_for_pickup' && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-[10px] h-6 px-2"
                        onClick={() => handleUpdateStatus(r.id, 'completed')}
                      >
                        Mark Retrieved
                      </Button>
                    )}
                    <Link to={`/reservations/${r.id}`}>
                      <Button variant="ghost" size="sm" className="text-[10px] h-6 px-1.5 text-slate-500">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

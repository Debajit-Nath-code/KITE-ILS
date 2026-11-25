import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BookOpen, 
  User, 
  RefreshCw 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { LibraryService } from '../../services/mockLibraryService';
import { LoanRecord } from '../../types';

export const AdminBorrowingPage: React.FC = () => {
  const { toast } = useToast();
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLoans = async () => {
    const data = await LibraryService.getActiveLoans();
    setLoans(data);
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleRenew = async (loanId: string) => {
    const res = await LibraryService.renewLoan(loanId);
    if (res) {
      toast.success('Loan Renewed', 'Due date extended by 30 days.');
      loadLoans();
    } else {
      toast.error('Renewal Limit', 'Maximum renewals reached for this patron.');
    }
  };

  const handleReturn = (loanId: string, title: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== loanId));
    toast.success('Monograph Returned', `Checked in "${title}" to returns cart.`);
  };

  const filtered = loans.filter((l) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || l.bookTitle.toLowerCase().includes(q) || l.callNumber.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 select-none">
              Circulation Desk
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-xs text-slate-500">{loans.length} Active Checkouts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Borrowing & Circulation Register
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage physical checkouts, process automated chute returns, and audit loan renewal allowances.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadLoans} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Loans
        </Button>
      </div>

      <Card className="p-4 bg-white border-slate-200 shadow-2xs">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search book title, call number..."
            className="w-full h-9 px-3 pl-9 bg-slate-50 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </Card>

      <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Book Monograph</th>
                <th className="px-4 py-3">Call Number</th>
                <th className="px-4 py-3">Borrowed Date</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Renewals Left</th>
                <th className="px-4 py-3 text-right">Circulation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <span className="font-serif font-bold text-slate-900 block">{l.bookTitle}</span>
                    <span className="text-[11px] text-slate-500">{l.bookAuthors.join(', ')}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">{l.callNumber}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono">{l.borrowedDate}</td>
                  <td className="px-4 py-3 font-mono font-medium text-slate-900">
                    <span className={l.isOverdue ? 'text-rose-600 font-bold' : ''}>{l.dueDate}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">{l.renewalsRemaining} of 2</td>
                  <td className="px-4 py-3 text-right space-x-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[11px] h-7 px-2"
                      onClick={() => handleRenew(l.id)}
                      disabled={l.renewalsRemaining <= 0}
                    >
                      Extend Loan
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-[11px] h-7 px-2"
                      onClick={() => handleReturn(l.id, l.bookTitle)}
                    >
                      Process Return
                    </Button>
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

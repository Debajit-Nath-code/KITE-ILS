import React, { useState, useEffect } from 'react';
import { PageContainer } from '../layouts/PageContainer';
import { PageHeading, Subheading, MonospaceCallout } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { SegmentedControl } from '../components/ui/Input';
import { MetadataSeparator } from '../components/ui/Badge';
import { NoLoansEmpty } from '../components/ui/EmptyState';
import { TableRowSkeleton } from '../components/ui/LoadingState';
import { useToast } from '../components/ui/Toast';
import { LibraryService } from '../services/mockLibraryService';
import { LoanRecord } from '../types';
import { 
  BookMarked, 
  Calendar, 
  RotateCw, 
  BookOpen, 
  ExternalLink, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyLibraryPage: React.FC = () => {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'loans' | 'history'>('loans');
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    LibraryService.getActiveLoans().then((data) => {
      setLoans(data);
      setLoading(false);
    });
  }, []);

  const handleRenew = async (loanId: string) => {
    setRenewingId(loanId);
    try {
      const updated = await LibraryService.renewLoan(loanId);
      if (updated) {
        setLoans((prev) => prev.map((l) => (l.id === loanId ? updated : l)));
        toast.success(
          'Loan Extended',
          `Extended by 30 days. New due date: ${updated.dueDate} (${updated.renewalsRemaining} renewals left).`
        );
      } else {
        toast.error('Renewal Limit Reached', 'This item has reached maximum allowable renewals.');
      }
    } catch {
      toast.error('Renewal Failed', 'Unable to reach circulation system.');
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <PageContainer
      maxWidth="standard"
      header={
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 block mb-1 select-none">
            Patron Management
          </span>
          <PageHeading>My Library & Reading Progress</PageHeading>
          <Subheading className="mt-1">
            Track active physical book checkouts, automated due dates, and cross-platform reading progress.
          </Subheading>
        </div>
      }
      actions={
        <SegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { label: 'Active Loans', value: 'loans', count: loans.length },
            { label: 'Loan History', value: 'history', count: 18 },
          ]}
        />
      }
    >
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6">
          <table className="w-full">
            <tbody>
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </tbody>
          </table>
        </div>
      ) : activeTab === 'loans' && loans.length === 0 ? (
        <NoLoansEmpty onExplore={() => navigate('/')} />
      ) : activeTab === 'loans' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loans.map((loan) => (
              <Card key={loan.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Circulation Loan
                    </span>
                    <MonospaceCallout>{loan.callNumber}</MonospaceCallout>
                  </div>
                  <CardTitle className="text-base line-clamp-1">
                    {loan.bookTitle}
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    {loan.bookAuthors.join(', ')}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Due Date Alert Box */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Due: <strong className="font-semibold text-slate-900">{loan.dueDate}</strong></span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {loan.renewalsRemaining} renewals left
                    </span>
                  </div>

                  {/* Reading Progress Synchronization Bar */}
                  {typeof loan.readingProgress === 'number' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                          <span>Reading Progress</span>
                        </span>
                        <span className="font-mono text-xs font-semibold tabular-nums text-slate-900">
                          {loan.readingProgress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full transition-all duration-300"
                          style={{ width: `${loan.readingProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Synchronized with Kite e-Reader & physical study bookmark
                      </p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="bg-slate-50/50">
                  <span className="text-[11px] text-slate-500">
                    Checked out: {loan.borrowedDate}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    isLoading={renewingId === loan.id}
                    leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                    onClick={() => handleRenew(loan.id)}
                  >
                    Renew
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* History Archive Tab */
        <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center max-w-lg mx-auto">
          <BookMarked className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="font-serif text-lg font-medium text-slate-900">
            Past Research Borrowing History
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            18 academic monographs and journal folios returned in good condition. All records archived for academic citation export.
          </p>
        </div>
      )}
    </PageContainer>
  );
};

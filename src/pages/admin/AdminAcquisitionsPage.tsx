import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  Plus, 
  ArrowRight,
  RefreshCw 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { LibraryService } from '../../services/mockLibraryService';
import { AcquisitionRequest, AcquisitionStatus } from '../../types';

export const AdminAcquisitionsPage: React.FC = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<AcquisitionRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadRequests = async () => {
    const data = await LibraryService.getAcquisitions();
    setRequests(data);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = async (id: string, nextStatus: AcquisitionStatus) => {
    await LibraryService.updateAcquisitionStatus(id, nextStatus);
    toast.success('Acquisition Pipeline Updated', `Status changed to ${nextStatus.toUpperCase()}.`);
    loadRequests();
  };

  const filtered = requests.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 select-none">
              Collection Development
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-xs text-slate-500">{requests.length} Proposals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Acquisitions Review Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Evaluate student and faculty recommendations for unheld titles, allocate budget, and track procurement.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadRequests} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {['all', 'under_review', 'ordered', 'available'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filterStatus === st ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((req) => (
          <Card key={req.id} className="p-4 sm:p-5 bg-white border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {req.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{req.department}</span>
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900 mt-1">{req.title}</h3>
                <span className="text-xs text-slate-600">By {req.authors} {req.isbn && `· ISBN: ${req.isbn}`}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    req.status === 'under_review'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : req.status === 'ordered'
                      ? 'bg-sky-100 text-sky-900 border border-sky-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}
                >
                  {req.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
              <div><strong>Requester:</strong> {req.requestedBy} ({req.requestedAt})</div>
              {req.courseCode && <div><strong>Course Reserve:</strong> {req.courseCode}</div>}
              {req.notes && <div><strong>Faculty Rationale:</strong> {req.notes}</div>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              {req.status === 'under_review' && (
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleUpdateStatus(req.id, 'ordered')}
                >
                  Approve & Issue Purchase Order
                </Button>
              )}
              {req.status === 'ordered' && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleUpdateStatus(req.id, 'available')}
                >
                  Confirm Physical Delivery & Catalog
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

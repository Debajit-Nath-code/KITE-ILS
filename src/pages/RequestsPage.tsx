import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { PageContainer } from '../layouts/PageContainer';
import { PageHeading, Subheading, MonospaceCallout } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import { LibraryService } from '../services/mockLibraryService';
import { AcquisitionRequest } from '../types';
import { 
  FolderPlus, 
  Send, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Layers, 
  Building2, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'requested', label: 'REQUESTED' },
  { id: 'under_review', label: 'UNDER REVIEW' },
  { id: 'approved', label: 'APPROVED' },
  { id: 'ordered', label: 'ORDERED' },
  { id: 'available', label: 'AVAILABLE' },
] as const;

export const RequestsPage: React.FC = () => {
  const location = useLocation();
  const { toast } = useToast();

  const [requests, setRequests] = useState<AcquisitionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publisher, setPublisher] = useState('');
  const [courseSubject, setCourseSubject] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [reasonForRequest, setReasonForRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success view state after submission
  const [submittedRequest, setSubmittedRequest] = useState<AcquisitionRequest | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    const data = await LibraryService.getAcquisitions();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();

    const handleUpdate = () => {
      loadRequests();
    };

    window.addEventListener('kite_ils_acquisitions_updated', handleUpdate);
    return () => {
      window.removeEventListener('kite_ils_acquisitions_updated', handleUpdate);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) {
      toast.error('Validation Error', 'Book Title is a required field.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await LibraryService.addAcquisitionRequest({
        title: bookTitle.trim(),
        authors: author.trim() || 'Academic Faculty / Scholar',
        author: author.trim() || 'Academic Faculty / Scholar',
        isbn: isbn.trim(),
        publisher: publisher.trim() || 'University Academic Press',
        courseCode: courseSubject.trim(),
        department: department.trim(),
        reason: reasonForRequest.trim(),
        notes: reasonForRequest.trim(),
        requestedBy: 'Alex Chen (Student)',
        requestedAt: new Date().toISOString().split('T')[0],
      });

      setSubmittedRequest(created);
      setIsSubmitting(false);

      // Reset form
      setBookTitle('');
      setAuthor('');
      setIsbn('');
      setPublisher('');
      setCourseSubject('');
      setReasonForRequest('');

      // Prompt required notification: Acquisition request submitted
      toast.success(
        'Acquisition Request Submitted ✅',
        `Request ${created.id} for "${created.title}" is under review by collection committee.`
      );
    } catch {
      setIsSubmitting(false);
      toast.error('Submission Failed', 'Unable to record acquisition request.');
    }
  };

  const getStageIndex = (status: string) => {
    const norm = status.toLowerCase();
    if (norm === 'requested') return 0;
    if (norm === 'under_review' || norm === 'faculty_endorsed') return 1;
    if (norm === 'approved') return 2;
    if (norm === 'ordered') return 3;
    if (norm === 'available' || norm === 'cataloging') return 4;
    return 1;
  };

  return (
    <PageContainer
      maxWidth="standard"
      header={
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 font-mono">
              Academic Collection Development
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-500">Student Acquisition Portal</span>
          </div>
          <PageHeading>Monograph Acquisition Requests</PageHeading>
          <Subheading className="mt-1">
            Recommend academic books and syllabi monographs not currently held by university library stacks.
          </Subheading>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Acquisition Form or Post-Submission Success Card */}
        <div className="lg:col-span-5">
          {submittedRequest ? (
            <Card className="p-6 bg-white border-emerald-300/80 shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Request Submitted Successfully ✅
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your request has been logged into the Kite acquisition pipeline.
                  </p>
                </div>
              </div>

              {/* Request ID & Status Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 uppercase tracking-wider text-[11px]">Request ID:</span>
                  <span className="font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded text-sm">
                    {submittedRequest.id}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 uppercase tracking-wider text-[11px]">Status:</span>
                  <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-xs uppercase">
                    UNDER REVIEW
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-sans text-xs">
                  <span className="text-slate-500">Title:</span>
                  <span className="font-serif font-semibold text-slate-900 truncate max-w-[200px]">
                    {submittedRequest.title}
                  </span>
                </div>
              </div>

              {/* REQUEST STATUS PIPELINE Diagram */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold block">
                  REQUEST STATUS PIPELINE:
                </span>

                <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">REQUESTED</span>
                    <span className="text-slate-500">✓ Completed</span>
                  </div>
                  <div className="text-center text-slate-600 text-xs">↓</div>
                  <div className="flex items-center justify-between text-amber-300 font-bold bg-amber-950/60 p-1.5 rounded border border-amber-500/40">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>UNDER REVIEW</span>
                    </span>
                    <span className="text-[10px] uppercase font-normal">Active Stage</span>
                  </div>
                  <div className="text-center text-slate-600 text-xs">↓</div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>APPROVED</span>
                    <span className="text-slate-600 text-[10px]">Queue</span>
                  </div>
                  <div className="text-center text-slate-600 text-xs">↓</div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>ORDERED</span>
                    <span className="text-slate-600 text-[10px]">Dispatch</span>
                  </div>
                  <div className="text-center text-slate-600 text-xs">↓</div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>AVAILABLE</span>
                    <span className="text-slate-600 text-[10px]">On Shelf</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="md"
                className="w-full text-xs"
                onClick={() => setSubmittedRequest(null)}
              >
                Submit Another Request
              </Button>
            </Card>
          ) : (
            <Card className="p-6 bg-white shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <FolderPlus className="w-5 h-5 text-slate-700" />
                <h3 className="font-serif text-lg font-medium text-slate-900">
                  REQUEST FORM
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <Input
                  label="Book Title *"
                  placeholder="e.g. Designing Data-Intensive Applications"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  required
                />

                <Input
                  label="Author"
                  placeholder="e.g. Martin Kleppmann"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="ISBN"
                    placeholder="978-1449373320"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                  />

                  <Input
                    label="Publisher"
                    placeholder="e.g. O'Reilly Media"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Course / Subject"
                    placeholder="e.g. CS-452 Distributed Systems"
                    value={courseSubject}
                    onChange={(e) => setCourseSubject(e.target.value)}
                  />

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full h-11 sm:h-10 px-3 bg-white text-slate-900 text-base md:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    >
                      <option value="Computer Science & Engineering">Computer Science</option>
                      <option value="Physics & Applied Mathematics">Physics</option>
                      <option value="Mathematics & Statistics">Mathematics</option>
                      <option value="Biological Sciences">Biological Sciences</option>
                      <option value="Humanities & Social Sciences">Humanities</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Reason for Request
                  </label>
                  <textarea
                    rows={3}
                    value={reasonForRequest}
                    onChange={(e) => setReasonForRequest(e.target.value)}
                    placeholder="Required monograph for research thesis / syllabus addition..."
                    className="w-full p-3 text-xs sm:text-sm bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Submit Acquisition Request
                </Button>
              </form>
            </Card>
          )}
        </div>

        {/* Right Column: Students Previous Requests with Timeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div>
              <h3 className="font-serif text-lg font-medium text-slate-900">
                Previous Acquisition Requests
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track status timelines, collection committee approvals, and shelf delivery dates.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {requests.length} Requests
            </span>
          </div>

          <div className="space-y-4">
            {requests.map((req) => {
              const currentStage = getStageIndex(req.status);
              const lastUpdated = req.requestedAt;

              return (
                <Card key={req.id} className="p-5 bg-white space-y-4 hover:border-slate-300 transition-colors">
                  {/* Header Row: Title, Request ID, Date */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-900 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                          {req.id}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500 font-mono">
                          Date: {req.requestedAt}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400 font-mono">
                          Last updated: {lastUpdated}
                        </span>
                      </div>

                      <h4 className="font-serif text-base font-bold text-slate-900 mt-1">
                        {req.title}
                      </h4>
                      <p className="text-xs text-slate-600">
                        Author: {req.authors || req.author || 'Academic Scholar'}
                        {req.publisher && ` · Publisher: ${req.publisher}`}
                        {req.courseCode && ` · Course: ${req.courseCode}`}
                      </p>
                    </div>

                    <div className="shrink-0 sm:text-right">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-0.5">
                        Status
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold font-mono uppercase bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                      Status Timeline:
                    </span>

                    <div className="overflow-x-auto pb-1">
                      <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[10px] min-w-[360px] sm:min-w-0">
                        {PIPELINE_STAGES.map((stage, idx) => {
                          const isDone = idx < currentStage;
                          const isCurrent = idx === currentStage;

                          return (
                            <div
                              key={stage.id}
                              className={`p-2 rounded border flex flex-col items-center justify-between gap-1 transition-all ${
                                isCurrent
                                  ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-2xs'
                                  : isDone
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              }`}
                            >
                              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] mb-0.5 font-bold">
                                {isDone ? '✓' : idx + 1}
                              </span>
                              <span className="leading-tight truncate w-full text-[9px]">
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {(req.notes || req.reason) && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                      "{req.reason || req.notes}"
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

import React, { useState } from 'react';
import { PageContainer } from '../layouts/PageContainer';
import { 
  DisplayHeading, 
  PageHeading, 
  SectionHeading, 
  Subheading, 
  Text, 
  MonospaceCallout, 
  Kicker 
} from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Input, SearchInput, Select, SegmentedControl } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { StatusIndicator, FormatBadge, MetadataSeparator } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Dropdown } from '../components/ui/Dropdown';
import { BookCardSkeleton, TableRowSkeleton, AcademicSpinner } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { 
  Sparkles, 
  Check, 
  AlertCircle, 
  Info, 
  Download, 
  Search, 
  Compass, 
  SlidersHorizontal,
  Layers,
  Palette
} from 'lucide-react';

export const DesignSystemShowcasePage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [segmentedVal, setSegmentedVal] = useState<'all' | 'physical' | 'ebook'>('all');
  const [textInputVal, setTextInputVal] = useState('Martin Kleppmann');
  const [searchVal, setSearchVal] = useState('');
  const { toast } = useToast();

  return (
    <PageContainer
      maxWidth="standard"
      header={
        <div>
          <Kicker>Kite ILS Design System</Kicker>
          <PageHeading>Foundation & Component Catalog</PageHeading>
          <Subheading className="mt-1">
            Production-grade visual language for university research libraries, built on strict anti-slop rules, restrained color harmony, and academic typography.
          </Subheading>
        </div>
      }
    >
      <div className="space-y-12">
        {/* 1. Color Palette System */}
        <section className="space-y-4">
          <SectionHeading>1. Neo-Brutalist Color Architecture</SectionHeading>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-xs">
            <div className="p-4 bg-[#F5F0E6] text-[#111111] space-y-1 border-3 border-[#111111] shadow-[4px_4px_0px_#111111]">
              <span className="font-heading font-bold uppercase block">Warm Paper</span>
              <span className="font-mono text-[#111111]/70 text-[11px] font-bold">#F5F0E6</span>
              <span className="text-[10px] text-[#111111]/70 block pt-1 font-sans">Primary Background</span>
            </div>
            <div className="p-4 bg-[#111111] text-[#F5F0E6] space-y-1 border-3 border-[#111111] shadow-[4px_4px_0px_#FFD83D]">
              <span className="font-heading font-bold uppercase block text-[#FFD83D]">Near-Black</span>
              <span className="font-mono text-[#F5F0E6]/70 text-[11px] font-bold">#111111</span>
              <span className="text-[10px] text-[#F5F0E6]/70 block pt-1 font-sans">Borders, Text, Hard Shadows</span>
            </div>
            <div className="p-4 bg-[#FFD83D] text-[#111111] space-y-1 border-3 border-[#111111] shadow-[4px_4px_0px_#111111]">
              <span className="font-heading font-bold uppercase block">Warm Yellow</span>
              <span className="font-mono text-[#111111]/70 text-[11px] font-bold">#FFD83D</span>
              <span className="text-[10px] text-[#111111]/80 block pt-1 font-sans">Primary CTA, Highlights</span>
            </div>
            <div className="p-4 bg-[#F26B32] text-white space-y-1 border-3 border-[#111111] shadow-[4px_4px_0px_#111111]">
              <span className="font-heading font-bold uppercase block">Orange</span>
              <span className="font-mono text-white/80 text-[11px] font-bold">#F26B32</span>
              <span className="text-[10px] text-white/90 block pt-1 font-sans">Active Notice, Urgent Holds</span>
            </div>
            <div className="p-4 bg-[#24A9C7] text-white space-y-1 border-3 border-[#111111] shadow-[4px_4px_0px_#111111]">
              <span className="font-heading font-bold uppercase block">Electric Blue</span>
              <span className="font-mono text-white/80 text-[11px] font-bold">#24A9C7</span>
              <span className="text-[10px] text-white/90 block pt-1 font-sans">Wayfinding, Navigation</span>
            </div>
            <div className="p-4 bg-[#7654D9] text-white space-y-1 border-3 border-[#111111] shadow-[4px_4px_0px_#111111]">
              <span className="font-heading font-bold uppercase block">Purple</span>
              <span className="font-mono text-white/80 text-[11px] font-bold">#7654D9</span>
              <span className="text-[10px] text-white/90 block pt-1 font-sans">Collections, Monograph Tags</span>
            </div>
            <div className="p-4 bg-[#43C95E] text-[#111111] space-y-1 border-3 border-[#111111] shadow-[4px_4px_0px_#111111]">
              <span className="font-heading font-bold uppercase block">Green</span>
              <span className="font-mono text-[#111111]/70 text-[11px] font-bold">#43C95E</span>
              <span className="text-[10px] text-[#111111]/80 block pt-1 font-sans">Available On Shelf</span>
            </div>
          </div>
        </section>

        {/* 2. Typographic Scale */}
        <section className="space-y-4">
          <SectionHeading>2. Typographic Hierarchy & Neo-Brutalist Pairing</SectionHeading>
          <div className="bg-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] p-6 space-y-6">
            <div className="border-b-2 border-[#111111] pb-4">
              <span className="text-[11px] font-mono font-bold text-[#111111]/60 uppercase block mb-1">
                Display Heading · Archivo Black / Space Grotesk
              </span>
              <DisplayHeading className="text-2xl sm:text-4xl">
                ACADEMIC KNOWLEDGE STACKS REIMAGINED
              </DisplayHeading>
            </div>

            <div className="border-b-2 border-[#111111] pb-4">
              <span className="text-[11px] font-mono font-bold text-[#111111]/60 uppercase block mb-1">
                Page Heading · Archivo Black
              </span>
              <PageHeading>
                REAL-TIME BOOK AVAILABILITY & SHELF ROUTING
              </PageHeading>
            </div>

            <div className="border-b-2 border-[#111111] pb-4">
              <span className="text-[11px] font-mono font-bold text-[#111111]/60 uppercase block mb-1">
                Section Heading & Editorial Prose · Plus Jakarta Sans
              </span>
              <SectionHeading>SECTION 04. PHYSICAL SHELF STACKS WAYFINDING</SectionHeading>
              <Text className="mt-1 max-w-2xl">
                Scholarly discovery requires zero cognitive friction. By pairing RFID shelf coordinates with synchronized digital facsimiles, researchers locate monographs in seconds.
              </Text>
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold text-[#111111]/60 uppercase block mb-1">
                Catalog Callouts · JetBrains Mono (Bold Tabular Badges)
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <MonospaceCallout>QA76.9.D3 K54 2023</MonospaceCallout>
                <MonospaceCallout>NA9031 .R6713 2020</MonospaceCallout>
                <MonospaceCallout>QC174.12 .N54 2021</MonospaceCallout>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Button Controls */}
        <section className="space-y-4">
          <SectionHeading>3. Tactile Physical Action Buttons (Press to Move to Shadow)</SectionHeading>
          <div className="bg-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">PRIMARY [RESERVE BOOK]</Button>
              <Button variant="secondary">SECONDARY BUTTON</Button>
              <Button variant="accent">ACCENT WAYFIND</Button>
              <Button variant="outline">OUTLINE</Button>
              <Button variant="ghost">GHOST BUTTON</Button>
              <Button variant="danger">DANGER ACTION</Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t-2 border-[#111111]">
              <Button size="sm" variant="primary">SMALL (32PX)</Button>
              <Button size="md" variant="primary">MEDIUM (40PX)</Button>
              <Button size="lg" variant="primary">LARGE (48PX)</Button>
              <Button variant="secondary" leftIcon={<Compass className="w-4 h-4" />}>
                WITH LEFT ICON
              </Button>
              <Button variant="secondary" rightIcon={<Sparkles className="w-4 h-4" />}>
                WITH RIGHT ICON
              </Button>
              <Button variant="primary" isLoading={true}>
                LOADING STATE
              </Button>
              <Button variant="secondary" disabled={true}>
                DISABLED
              </Button>
            </div>
          </div>
        </section>

        {/* 4. Form Inputs & Search Controls */}
        <section className="space-y-4">
          <SectionHeading>4. Inputs, Search & Segmented Controls</SectionHeading>
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Patron Author Search"
                value={textInputVal}
                onChange={(e) => setTextInputVal(e.target.value)}
                helperText="Search by primary contributor or editor"
              />
              <Input
                label="Course ID Validation"
                defaultValue="CS-840"
                error="Course reserves must have syllabus confirmation"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Full Catalog Search Bar (with Shortcut Badge)
              </label>
              <SearchInput
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onClear={() => setSearchVal('')}
                placeholder="Search 84,000+ volumes by title, ISBN, or LC code..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Segmented Filter Tabs (Zero-Pill Discipline)
              </label>
              <SegmentedControl
                value={segmentedVal}
                onChange={setSegmentedVal}
                options={[
                  { label: 'All Catalog Records', value: 'all', count: 420 },
                  { label: 'Physical Stacks', value: 'physical', count: 310 },
                  { label: 'Synchronized eBooks', value: 'ebook', count: 110 },
                ]}
              />
            </div>
          </div>
        </section>

        {/* 5. Badges & Unboxed Metadata */}
        <section className="space-y-4">
          <SectionHeading>5. Status Indicators & Metadata Discipline</SectionHeading>
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Real-Time Physical & Loan Statuses:
              </span>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <StatusIndicator status="available_shelf" />
                <StatusIndicator status="ready_for_pickup" />
                <StatusIndicator status="reserved_hold" />
                <StatusIndicator status="in_retrieval" />
                <StatusIndicator status="checked_out" />
                <StatusIndicator status="reference_only" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Unboxed Academic Metadata Line:
              </span>
              <div className="flex items-center text-xs text-slate-600">
                <span className="font-medium text-slate-900">Dr. Aris Thorne</span>
                <MetadataSeparator />
                <span>Computing & Information Science</span>
                <MetadataSeparator />
                <span>Patron #KIT-8849-012</span>
                <MetadataSeparator />
                <span className="font-mono text-emerald-700 font-medium">Clear Standing</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Overlays, Modals, Dropdowns & Toasts */}
        <section className="space-y-4">
          <SectionHeading>6. Overlays, Dropdowns, Modals & Toast Triggers</SectionHeading>
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" onClick={() => setModalOpen(true)}>
                Open Dialog Modal
              </Button>

              <Dropdown
                align="left"
                trigger={
                  <Button variant="secondary">
                    Dropdown Menu Demo
                  </Button>
                }
                items={[
                  { id: '1', label: 'Export Citation (BibTeX)', icon: <Download className="w-4 h-4" /> },
                  { id: '2', label: 'View Stacks Floor Map', icon: <Compass className="w-4 h-4" /> },
                  { id: '3', label: 'Report Missing Book', danger: true, dividerBefore: true },
                ]}
              />

              <Button
                variant="secondary"
                onClick={() => toast.success('Book Held in Locker #14B', 'Passcode 7842 is active for 48 hours.')}
              >
                Trigger Success Toast
              </Button>

              <Button
                variant="secondary"
                onClick={() => toast.warning('Loan Due in 3 Days', 'Please renew or return to circulation desk.')}
              >
                Trigger Warning Toast
              </Button>

              <Button
                variant="secondary"
                onClick={() => toast.error('Checkout Limit Reached', 'Maximum 10 concurrent research loans allowed.')}
              >
                Trigger Error Toast
              </Button>
            </div>
          </div>
        </section>

        {/* 7. Loading States & Skeletons */}
        <section className="space-y-4">
          <SectionHeading>7. Loading States & Skeletons</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BookCardSkeleton />
            <BookCardSkeleton />
          </div>
        </section>

        {/* 8. Empty States */}
        <section className="space-y-4">
          <SectionHeading>8. Empty State Archetypes</SectionHeading>
          <EmptyState
            title="Search Catalog Query Yielded No Copies"
            description="Try modifying your keywords, broadening academic discipline facets, or recommending a new volume to university acquisitions."
            actionLabel="Clear Filter Criteria"
            onAction={() => {}}
            secondaryActionLabel="Request Acquisition"
            onSecondaryAction={() => {}}
          />
        </section>
      </div>

      {/* Demo Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="University Library Dialogue System"
        description="This modal provides accessible, keyboard-dismissible dialog interactions for smart reservations and catalog actions."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setModalOpen(false);
                toast.success('Action Recorded', 'Modal confirmed smoothly.');
              }}
            >
              Confirm Selection
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs sm:text-sm text-slate-600">
          <p>
            Every modal features background blur scrim, keyboard <kbd className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">Esc</kbd> dismissal, and responsive max-width containment.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
            <strong className="text-slate-800">Clean Architectural Rule:</strong> No nested card boundaries or unnecessary pill enclosures inside dialogue bodies.
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  BookMarked, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Search, 
  FolderPlus, 
  Laptop, 
  RefreshCw, 
  MapPin, 
  ShieldCheck, 
  Building2 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DisplayHeading, PageHeading, SectionHeading, Subheading, MonospaceCallout, Kicker } from '../components/ui/Typography';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // The 4-step Kite Journey
  const journeySteps = [
    {
      step: '01',
      title: 'DISCOVER',
      subtitle: 'UNIFIED ACADEMIC SEARCH',
      description: 'Search physical monographs, course reserves, and research journals across all campus branches with standardized classification call numbers.',
      accent: 'bg-[#FFD83D]',
      icon: <Search className="w-5 h-5 text-[#111111]" />,
      callout: 'QA76.9.D3 K54',
    },
    {
      step: '02',
      title: 'RESERVE',
      subtitle: 'SMART HOLD & LOCKER QUEUE',
      description: 'Place items on automated hold. Books are routed to 24/7 smart lockers or circulation service desks with instant pickup passcodes.',
      accent: 'bg-[#F26B32]',
      icon: <BookMarked className="w-5 h-5 text-white" />,
      callout: 'LOCKER #14B',
    },
    {
      step: '03',
      title: 'NAVIGATE',
      subtitle: 'SPATIAL STACKS WAYFINDING',
      description: 'Follow turn-by-turn indoor directions directly to the specific floor, aisle bay, and shelf tier without wandering the stacks.',
      accent: 'bg-[#24A9C7]',
      icon: <Compass className="w-5 h-5 text-white" />,
      callout: 'FLOOR 3 · BAY 03',
    },
    {
      step: '04',
      title: 'ACCESS',
      subtitle: 'CONTINUOUS READING & DIGITAL SYNC',
      description: 'Switch seamlessly between physical print volumes and synchronized digital facsimiles with cross-device reading progress.',
      accent: 'bg-[#43C95E]',
      icon: <Laptop className="w-5 h-5 text-[#111111]" />,
      callout: 'PROGRESS: 68%',
    },
  ];

  // Major Kite Capabilities
  const capabilities = [
    {
      title: 'SMART DISCOVERY',
      description: 'Deep faceted search across titles, contributors, subjects, and Library of Congress call numbers with intuitive campus filtering.',
      tag: 'SEARCH ENGINE',
      accentColor: 'yellow',
      icon: <Search className="w-5 h-5 text-[#111111]" />,
    },
    {
      title: 'SMART RESERVATION',
      description: 'Automated physical holds with designated locker retrieval points, waitlist position tracking, and loan extension controls.',
      tag: 'CIRCULATION',
      accentColor: 'orange',
      icon: <BookMarked className="w-5 h-5 text-[#111111]" />,
    },
    {
      title: 'SPATIAL WAYFINDING',
      description: 'Floor-by-floor coordinate maps guiding patrons to the exact shelf range, tier level, and aisle number in university stacks.',
      tag: 'SPATIAL INDOOR',
      accentColor: 'blue',
      icon: <Compass className="w-5 h-5 text-[#111111]" />,
    },
    {
      title: 'DIGITAL ACCESS',
      description: 'Direct institutional access to electronic monographs, scanned course readings, and academic journal repositories.',
      tag: 'ELECTRONIC EDITIONS',
      accentColor: 'purple',
      icon: <Laptop className="w-5 h-5 text-[#111111]" />,
    },
    {
      title: 'SMART SYNC',
      description: 'Synchronized reading bookmarks and chapter progress across physical checkouts, desktop readers, and tablet devices.',
      tag: 'CROSS-DEVICE',
      accentColor: 'pink',
      icon: <RefreshCw className="w-5 h-5 text-[#111111]" />,
    },
    {
      title: 'NEW ACQUISITIONS',
      description: 'Direct faculty and student proposal workflows for new monograph acquisitions, departmental reserve requests, and syllabi materials.',
      tag: 'COLLECTIONS',
      accentColor: 'green',
      icon: <FolderPlus className="w-5 h-5 text-[#111111]" />,
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E6]">
      {/* HERO SECTION */}
      <section className="relative border-b-4 border-[#111111] bg-grid-paper pt-14 sm:pt-20 pb-16 sm:pb-24 overflow-hidden">
        {/* Retro editorial decorative sticker stamps */}
        <div className="hidden lg:block absolute top-10 right-12 rotate-6 select-none pointer-events-none">
          <div className="bg-[#FFD83D] border-3 border-[#111111] shadow-[4px_4px_0px_#111111] px-4 py-2 font-mono font-bold text-xs uppercase tracking-wider text-[#111111]">
            ★ UNIVERSITY LIBRARY DEPLOYMENT 2026
          </div>
        </div>
        <div className="hidden lg:block absolute bottom-8 left-8 -rotate-3 select-none pointer-events-none">
          <div className="bg-[#24A9C7] text-white border-3 border-[#111111] shadow-[4px_4px_0px_#111111] px-3 py-1.5 font-mono font-bold text-[11px] uppercase tracking-wider">
            SPATIAL WAYFINDING · CS-201 TO CS-204
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Kicker>Next-Generation University Library Platform</Kicker>
          
          <DisplayHeading className="mt-4 text-4xl sm:text-6xl lg:text-7xl max-w-4xl mx-auto">
            YOUR LIBRARY, WITHOUT THE FRICTION.
          </DisplayHeading>

          <p className="mt-6 text-base sm:text-xl text-[#111111]/80 font-medium max-w-2xl mx-auto leading-relaxed">
            Find academic resources, reserve physical books, navigate directly to their stacks shelves, and continue reading digitally — all unified in one confident interface.
          </p>

          {/* Hero Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/discover">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                EXPLORE CATALOG
              </Button>
            </Link>

            {isAuthenticated ? (
              <Link to={user?.role === 'librarian' ? '/admin/dashboard' : '/dashboard'}>
                <Button size="lg" variant="secondary">
                  GO TO {user?.role === 'librarian' ? 'ADMIN DASHBOARD' : 'DASHBOARD'}
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="lg" variant="secondary">
                  PATRON SIGN IN
                </Button>
              </Link>
            )}
          </div>

          {/* Institutional Trust Ribbon */}
          <div className="mt-14 pt-8 border-t-3 border-[#111111] flex flex-wrap items-center justify-center gap-6 text-xs font-mono font-bold uppercase text-[#111111]">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <Building2 className="w-4 h-4 text-[#F26B32]" />
              <span>4 CAMPUS BRANCHES</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <ShieldCheck className="w-4 h-4 text-[#24A9C7]" />
              <span>SSO INTEGRATED</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <MapPin className="w-4 h-4 text-[#43C95E]" />
              <span>SHELF COORDINATE WAYFINDING</span>
            </div>
          </div>
        </div>
      </section>

      {/* KITE JOURNEY: DISCOVER -> RESERVE -> NAVIGATE -> ACCESS */}
      <section className="py-16 sm:py-20 bg-[#F5F0E6] border-b-4 border-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Kicker>The Core Experience</Kicker>
            <PageHeading className="mt-2">
              A SEAMLESS 4-STEP PATRON FLOW
            </PageHeading>
            <Subheading className="mt-3">
              Traditional library systems force patrons across disconnected catalogs, confusing physical stack layouts, and fragmented e-readers. Kite unifies the entire lifecycle.
            </Subheading>
          </div>

          {/* Journey Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {journeySteps.map((step, idx) => (
              <div 
                key={step.title}
                className="relative bg-white border-3 border-[#111111] shadow-[6px_6px_0px_#111111] p-6 flex flex-col justify-between hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[9px_9px_0px_#111111] transition-all duration-100"
              >
                <div>
                  {/* Step Index & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-black tracking-wider text-[#111111] bg-[#FFD83D] border-2 border-[#111111] px-2 py-0.5">
                      STEP {step.step}
                    </span>
                    <div className={`p-2 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] ${step.accent}`}>
                      {step.icon}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-heading text-2xl font-black uppercase tracking-tight text-[#111111]">
                    {step.title}
                  </h3>
                  <p className="text-[11px] font-mono font-bold uppercase text-[#111111]/70 mt-1">
                    {step.subtitle}
                  </p>

                  <p className="text-xs text-[#111111]/80 font-medium mt-3 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Callout Indicator */}
                <div className="mt-6 pt-4 border-t-2 border-[#111111] flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#111111]/60">SAMPLE</span>
                  <MonospaceCallout>{step.callout}</MonospaceCallout>
                </div>

                {/* Connector Arrow for Desktop */}
                {idx < journeySteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                    <div className="w-8 h-8 bg-[#FFD83D] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center text-[#111111] font-black text-sm">
                      →
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAJOR CAPABILITIES SECTION */}
      <section className="py-16 sm:py-20 bg-white border-b-4 border-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <Kicker>Capabilities</Kicker>
            <PageHeading className="mt-2">
              ENGINEERED FOR MODERN ACADEMIC RESEARCH
            </PageHeading>
            <Subheading className="mt-3">
              Every feature in Kite ILS is designed to strip away friction for university patrons, scholars, and library circulation staff.
            </Subheading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap) => (
              <div 
                key={cap.title} 
                className="p-6 bg-[#F5F0E6] border-3 border-[#111111] shadow-[5px_5px_0px_#111111] flex flex-col justify-between hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_#111111] transition-all duration-100"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center">
                      {cap.icon}
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#111111] bg-white border border-[#111111] px-2 py-0.5">
                      {cap.tag}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold uppercase text-[#111111] tracking-tight">
                    {cap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#111111]/80 font-medium mt-2 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick CTA Banner */}
          <div className="mt-14 p-8 bg-[#111111] text-[#F5F0E6] border-4 border-[#111111] shadow-[8px_8px_0px_#FFD83D] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#FFD83D]">
                READY TO EXPLORE THE UNIVERSITY COLLECTION?
              </h3>
              <p className="text-xs sm:text-sm text-[#F5F0E6]/80 font-medium max-w-xl">
                Search over 84,000 research monographs, check real-time shelf coordinates, or sign in to your patron account.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/discover">
                <Button variant="primary" size="md">
                  EXPLORE CATALOG
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="md">
                  PATRON SIGN IN
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

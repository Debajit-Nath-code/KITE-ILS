import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { KiteLogo } from '../assets/KiteLogo';
import { Clock, MapPin, ShieldCheck, ExternalLink } from 'lucide-react';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E6] text-[#111111] font-sans">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Editorial / Brutalist Institutional Footer */}
      <footer className="mt-auto bg-[#111111] text-[#F5F0E6] text-xs py-12 border-t-4 border-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1: Wordmark & Identity */}
            <div className="space-y-3">
              <div className="inline-block bg-[#F5F0E6] p-2 border-2 border-[#111111] shadow-[3px_3px_0px_#FFD83D]">
                <KiteLogo size={24} showText={true} />
              </div>
              <p className="text-[#F5F0E6]/70 leading-relaxed text-xs">
                Kite Integrated Library System is the next-generation digital catalog and spatial wayfinding platform for university research collections.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#FFD83D] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFD83D]" />
                <span>University Library System · Release 2026.1</span>
              </div>
            </div>

            {/* Col 2: Campus Libraries & Hours */}
            <div className="space-y-2">
              <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#FFD83D] mb-3">
                Campus Branches
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center justify-between text-[#F5F0E6]/80 border-b border-[#F5F0E6]/10 pb-1">
                  <span>Science & Engineering</span>
                  <span className="font-mono text-[#FFD83D] text-[11px] font-bold">24 / 7 Access</span>
                </li>
                <li className="flex items-center justify-between text-[#F5F0E6]/80 border-b border-[#F5F0E6]/10 pb-1">
                  <span>Humanities & Social Sciences</span>
                  <span className="font-mono text-[#F5F0E6]/60 text-[11px]">07:30 – 23:00</span>
                </li>
                <li className="flex items-center justify-between text-[#F5F0E6]/80 border-b border-[#F5F0E6]/10 pb-1">
                  <span>Fine Arts & Architecture</span>
                  <span className="font-mono text-[#F5F0E6]/60 text-[11px]">08:00 – 21:00</span>
                </li>
                <li className="flex items-center justify-between text-[#F5F0E6]/80 border-b border-[#F5F0E6]/10 pb-1">
                  <span>Medical Archive</span>
                  <span className="font-mono text-[#F5F0E6]/60 text-[11px]">06:00 – 00:00</span>
                </li>
              </ul>
            </div>

            {/* Col 3: Research Services */}
            <div className="space-y-2">
              <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#FFD83D] mb-3">
                Research Services
              </h4>
              <ul className="space-y-2 text-xs font-bold uppercase tracking-wide">
                <li>
                  <Link to="/requests" className="hover:text-[#FFD83D] hover:underline transition-colors block">
                    → Monograph Acquisition Requests
                  </Link>
                </li>
                <li>
                  <Link to="/reservations" className="hover:text-[#FFD83D] hover:underline transition-colors block">
                    → Automated Locker Pickup
                  </Link>
                </li>
                <li>
                  <Link to="/navigate" className="hover:text-[#FFD83D] hover:underline transition-colors block">
                    → Spatial Stacks Wayfinding
                  </Link>
                </li>
                <li>
                  <Link to="/design-system" className="hover:text-[#FFD83D] hover:underline transition-colors block">
                    → Design System Component Catalog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Operational Status */}
            <div className="space-y-2">
              <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#FFD83D] mb-3">
                System Status
              </h4>
              <div className="p-3 bg-[#111111] border-2 border-[#FFD83D] shadow-[3px_3px_0px_#FFD83D] space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#FFD83D] font-bold font-mono uppercase">
                  <span className="w-2.5 h-2.5 bg-[#43C95E] border border-[#111111]" />
                  <span>All Stacks Operational</span>
                </div>
                <p className="text-[11px] text-[#F5F0E6]/70 leading-normal font-sans">
                  Circulation and automated book delivery lockers are operating at normal university service hours.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#F5F0E6]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#F5F0E6]/60">
            <div>
              © 2026 Kite ILS · University Library Council. Engineered with Neo-Brutalist Architecture.
            </div>
            <div className="flex items-center gap-4 font-mono">
              <span className="hover:text-[#FFD83D] cursor-pointer">Catalog Terms</span>
              <span>·</span>
              <span className="hover:text-[#FFD83D] cursor-pointer">Accessibility (WCAG AA)</span>
              <span>·</span>
              <span className="hover:text-[#FFD83D] cursor-pointer">Interlibrary Loan Protocol</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

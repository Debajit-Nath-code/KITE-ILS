import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Copy, 
  CalendarCheck, 
  ArrowLeftRight, 
  FileText, 
  Map, 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Compass,
  Building2,
  Sparkles,
  ArrowRight,
  Search,
  Bell
} from 'lucide-react';
import { KiteLogo } from '../assets/KiteLogo';
import { Button } from '../components/ui/Button';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, loginAsDemo, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Verification: Only users with a librarian/admin role should see these routes
  const isLibrarian = isAuthenticated && (user?.role === 'librarian');

  if (!isLibrarian) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-semibold">
              Restricted Staff Clearance
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight mt-2">
              Librarian / Admin Access Only
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The Kite Integrated Library System administration console is reserved for university librarians, catalogers, and circulation supervisors.
            </p>
          </div>

          {/* Quick Demo Switcher */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Simulated Evaluation Access</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Switch immediately to the Head Librarian credentials for <strong>Prof. Margaret Vance</strong> (KIT-LIB-009) to access all administrative tools.
            </p>
            <Button
              variant="primary"
              size="md"
              className="w-full text-xs font-semibold"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              onClick={() => {
                loginAsDemo('librarian');
                navigate('/admin/dashboard');
              }}
            >
              Sign In as Head Librarian (Demo)
            </Button>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link to="/login">
              <Button variant="outline" size="sm" className="text-xs">
                Staff Login Page
              </Button>
            </Link>
            <Link to="/discover">
              <Button variant="ghost" size="sm" className="text-xs text-slate-600">
                Return to Public Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar navigation links required by the prompt:
  // Dashboard, Books, Book Copies, Reservations, Borrowing, Acquisition Requests, Library Map, Users
  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Books', path: '/admin/books', icon: BookOpen },
    { label: 'Book Copies', path: '/admin/copies', icon: Copy },
    { label: 'Reservations', path: '/admin/reservations', icon: CalendarCheck },
    { label: 'Borrowing', path: '/admin/borrowing', icon: ArrowLeftRight },
    { label: 'Acquisition Requests', path: '/admin/acquisitions', icon: FileText },
    { label: 'Library Map', path: '/admin/map', icon: Map },
    { label: 'Users', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row">
      {/* Mobile Sidebar Toggle Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2 min-w-0">
          <KiteLogo size={20} showText={true} />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-400/30 shrink-0">
            STAFF
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          aria-label="Toggle Navigation"
          aria-expanded={mobileSidebarOpen}
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ===================================================================== */}
      {/* DESKTOP / MOBILE SIDEBAR                                              */}
      {/* ===================================================================== */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40 h-[100dvh] md:h-screen w-64 max-w-[85vw] bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col shrink-0 transition-transform duration-200 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand / Stacks Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center justify-between gap-2">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <KiteLogo size={24} showText={true} />
              <span className="text-[9px] font-mono uppercase tracking-widest bg-sky-500/20 text-sky-300 font-bold px-1.5 py-0.5 rounded border border-sky-500/30">
                ILS STAFF
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ONLINE · STACKS</span>
            </span>
            <span>v2026.4</span>
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overscroll-contain">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Library Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`
                  flex items-center gap-3 min-h-[44px] md:min-h-0 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-sky-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-4 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Public Services
          </div>
          <Link
            to="/discover"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Discovery</span>
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <Link
            to="/navigate"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Spatial Wayfinding</span>
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </nav>

        {/* Logged in Librarian Profile Card in Footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-950 border border-sky-400/30 text-sky-200 font-serif font-bold text-xs flex items-center justify-center shrink-0">
              MV
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-white block truncate">
                {user?.fullName || 'Prof. Margaret Vance'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block truncate">
                {user?.patronNumber || 'KIT-LIB-009'} · Head Librarian
              </span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => {
                loginAsDemo('student');
                navigate('/dashboard');
              }}
              className="text-slate-400 hover:text-sky-300 transition-colors"
            >
              Switch to Student View
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ===================================================================== */}
      {/* MAIN ADMIN WORKSPACE                                                  */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

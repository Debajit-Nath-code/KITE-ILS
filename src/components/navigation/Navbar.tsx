import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  User, 
  Menu, 
  X, 
  BookMarked, 
  Compass, 
  Sparkles, 
  Layers, 
  LogOut, 
  ShieldCheck, 
  LogIn, 
  LayoutDashboard,
  GraduationCap
} from 'lucide-react';
import { KiteLogo } from '../../assets/KiteLogo';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { mockNotifications } from '../../data/mockData';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(
    mockNotifications.filter((n) => !n.read).length
  );

  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    toast.info('Signed Out', 'You have been disconnected from your library patron session.');
    navigate('/');
  };

  // Nav links based on authentication
  const navLinks = [
    ...(isAuthenticated ? [
      { label: 'Dashboard', path: user?.role === 'librarian' ? '/admin/dashboard' : '/dashboard' },
    ] : []),
    { label: 'Discover', path: '/discover' },
    { label: 'Navigate', path: '/navigate' },
    { label: 'Reservations', path: '/reservations' },
    { label: 'Requests', path: '/requests' },
    ...(isAuthenticated && user?.role !== 'librarian' ? [
      { label: 'My Library', path: '/my-library' },
    ] : []),
    { label: 'Design System', path: '/design-system' },
  ];

  // User Profile Dropdown Items
  const profileDropdownItems: DropdownItem[] = user ? [
    {
      id: 'profile-header',
      label: user.fullName,
      description: `${user.department} · ${user.patronNumber}`,
      disabled: true,
    },
    {
      id: 'dashboard-link',
      label: user.role === 'librarian' ? 'Librarian Dashboard' : 'Patron Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      onClick: () => navigate(user.role === 'librarian' ? '/admin/dashboard' : '/dashboard'),
    },
    {
      id: 'my-library-link',
      label: 'My Loans & Progress',
      icon: <BookMarked className="w-4 h-4" />,
      onClick: () => navigate('/my-library'),
    },
    {
      id: 'reservations-link',
      label: 'Active Holds & Lockers',
      icon: <Compass className="w-4 h-4" />,
      onClick: () => navigate('/reservations'),
    },
    {
      id: 'design-system-link',
      label: 'Design System Gallery',
      icon: <Layers className="w-4 h-4" />,
      onClick: () => navigate('/design-system'),
      dividerBefore: true,
    },
    {
      id: 'switch-role',
      label: user.role === 'librarian' ? 'Switch to Student View' : 'Switch to Librarian Mode',
      icon: <ShieldCheck className="w-4 h-4 text-sky-600" />,
      dividerBefore: true,
      onClick: () => {
        const nextRole = user.role === 'librarian' ? 'student' : 'librarian';
        loginAsDemo(nextRole);
        toast.info(
          nextRole === 'librarian' ? 'Librarian Mode Active' : 'Student Mode Active',
          nextRole === 'librarian' ? 'Signed in as Prof. Margaret Vance' : 'Signed in as Alex Chen'
        );
        navigate(nextRole === 'librarian' ? '/admin/dashboard' : '/dashboard');
      },
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      dividerBefore: true,
      onClick: handleSignOut,
    },
  ] : [];

  // Notification Dropdown Items
  const notificationDropdownItems: DropdownItem[] = [
    {
      id: 'notif-head',
      label: 'Library Notifications',
      description: `${unreadNotifications} unread alerts`,
      disabled: true,
    },
    ...mockNotifications.map((notif) => ({
      id: notif.id,
      label: notif.title,
      description: `${notif.description} · ${notif.timestamp}`,
      icon: <Sparkles className="w-4 h-4 text-sky-600" />,
      onClick: () => {
        if (notif.actionUrl) navigate(notif.actionUrl);
        setUnreadNotifications((prev) => Math.max(0, prev - 1));
      },
    })),
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F5F0E6] border-b-4 border-[#111111] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-2 sm:gap-6">
          {/* ZONE 1: Clean Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] p-1 bg-[#FFFFFF] border-3 border-[#111111] shadow-[3px_3px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
            aria-label="Kite ILS Home"
          >
            <KiteLogo size={28} showText={true} />
          </Link>

          {/* ZONE 2: Neo-Brutalist Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `
                  px-3 py-1.5 text-xs lg:text-xs font-heading font-bold uppercase tracking-wider whitespace-nowrap 
                  transition-all duration-100 border-2
                  ${
                    isActive
                      ? 'bg-[#FFD83D] text-[#111111] border-[#111111] shadow-[3px_3px_0px_#111111] -translate-y-0.5'
                      : 'border-transparent text-[#111111] hover:bg-[#FFFFFF] hover:border-[#111111] hover:shadow-[2px_2px_0px_#111111]'
                  }
                `}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* ZONE 3: 1-2 Primary Action / Utility Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Popover */}
                <Dropdown
                  align="right"
                  menuWidth="w-80"
                  items={notificationDropdownItems}
                  trigger={
                    <button
                      type="button"
                      className="relative min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center p-2 text-[#111111] bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform cursor-pointer"
                      aria-label="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#F05A79] border-2 border-[#111111]" />
                      )}
                    </button>
                  }
                />

                {/* User Profile Dropdown */}
                <Dropdown
                  align="right"
                  menuWidth="w-64"
                  items={profileDropdownItems}
                  trigger={
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 p-1.5 sm:px-3 sm:py-1.5 text-xs font-heading font-bold uppercase tracking-wider text-[#111111] bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform cursor-pointer"
                      aria-label="User account menu"
                    >
                      <div className={`w-6 h-6 border border-[#111111] ${user?.role === 'librarian' ? 'bg-[#F26B32]' : 'bg-[#24A9C7]'} text-[#FFFFFF] flex items-center justify-center text-[11px] font-bold shrink-0`}>
                        {user?.role === 'librarian' ? <ShieldCheck className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                      </div>
                      <span className="hidden sm:inline-block max-w-[120px] truncate">
                        {user?.fullName.split(' ')[0]}
                      </span>
                    </button>
                  }
                />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="secondary" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="hidden sm:inline-block">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-[#111111] bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-3 border-[#111111] bg-[#F5F0E6] px-4 pt-3 pb-6 space-y-1.5 shadow-[0px_4px_0px_#111111] max-h-[calc(100dvh-4.25rem)] overflow-y-auto overscroll-contain">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `
                flex items-center min-h-[44px] px-3.5 py-2.5 text-xs font-heading font-bold uppercase tracking-wider border-2 border-[#111111] mb-1.5 transition-colors
                ${
                  isActive
                    ? 'bg-[#FFD83D] text-[#111111] shadow-[2px_2px_0px_#111111]'
                    : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#FFD83D]'
                }
              `}
            >
              {link.label}
            </NavLink>
          ))}

          <div className="pt-3 border-t-2 border-[#111111] mt-2 space-y-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between gap-2 px-3 py-2 min-h-[44px] text-xs text-[#111111] font-mono bg-[#FFFFFF] border-2 border-[#111111]">
                <span className="truncate">{user?.email}</span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="min-h-[36px] px-2 font-bold text-[#F05A79] hover:underline uppercase ml-2 shrink-0 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

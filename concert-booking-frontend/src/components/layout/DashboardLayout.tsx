import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { ROUTES } from '../../constants/routes';
import { useAdminAuth } from '../../context/AdminAuthContext';

const navItems = [
  {
    label: 'Dashboard',
    path: ROUTES.ADMIN.DASHBOARD,
    exact: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
];

const concertNavItems = [
  {
    label: 'Concerts',
    path: ROUTES.ADMIN.CONCERTS,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  },
  {
    label: 'Tickets',
    path: ROUTES.ADMIN.TICKETS,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
];

const bookingNavItems = [
  {
    label: 'Bookings',
    path: ROUTES.ADMIN.BOOKINGS,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
  {
    label: 'Vouchers',
    path: ROUTES.ADMIN.VOUCHERS,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
];

const systemNavItems = [
  {
    label: 'Users',
    path: ROUTES.ADMIN.USERS,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: 'Roles',
    path: ROUTES.ADMIN.ROLES,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: 'Permissions',
    path: ROUTES.ADMIN.PERMISSIONS,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
];

interface NavItemProps {
  label: string;
  path: string;
  icon: React.ReactNode;
  exact?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, path, icon, exact, onClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = exact ? location.pathname === path : location.pathname === path;

  return (
    <button
      onClick={() => { navigate(path); onClick?.(); }}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left',
        isActive
          ? 'bg-primary text-white shadow-md shadow-primary/20'
          : 'text-gray-400 hover:bg-white/10 hover:text-white'
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

const SidebarContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { adminEmail, logoutAdmin } = useAdminAuth() as any;
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutAdmin();
    navigate(ROUTES.ADMIN.LOGIN);
  };

  return (
    <div className="flex flex-col h-full bg-[#1E1B4B]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm">ShowPass</p>
            <p className="text-purple-300 text-xs">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-3 mb-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">Overview</p>
          {navItems.map(item => <NavItem key={item.path} {...item} onClick={onClose} />)}
        </div>
        <div>
          <p className="px-3 mb-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">Events</p>
          {concertNavItems.map(item => <NavItem key={item.path} {...item} onClick={onClose} />)}
        </div>
        <div>
          <p className="px-3 mb-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">Commerce</p>
          {bookingNavItems.map(item => <NavItem key={item.path} {...item} onClick={onClose} />)}
        </div>
        <div>
          <p className="px-3 mb-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">System</p>
          {systemNavItems.map(item => <NavItem key={item.path} {...item} onClick={onClose} />)}
        </div>
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {(adminEmail || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{adminEmail || 'Administrator'}</p>
            <p className="text-purple-400 text-xs">Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdminLoggedIn, isAdminInitialized } = useAdminAuth() as any;

  React.useEffect(() => {
    if (isAdminInitialized && !isAdminLoggedIn) {
      navigate(ROUTES.ADMIN.LOGIN, { replace: true });
    }
  }, [isAdminInitialized, isAdminLoggedIn, navigate]);

  // Page title from current route
  const pageTitle = React.useMemo(() => {
    const allItems = [...navItems, ...concertNavItems, ...bookingNavItems, ...systemNavItems];
    return allItems.find(i => i.path === location.pathname)?.label ?? 'Dashboard';
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden animate-slide-in-right">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
          <div className="flex items-center h-16 px-4 lg:px-6 gap-4">
            <button
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-800">{pageTitle}</h1>
            <div className="flex items-center gap-2 ml-auto">
              <span className="hidden sm:block text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
                Admin Console
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

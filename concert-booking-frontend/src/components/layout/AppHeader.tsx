import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useCategory } from '../../context/CategoryContext';
import { useSearch } from '../../context/SearchContext';
import { categoryService } from '../../services/concertService';
import { Category } from '../../types';

export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const { selectedCategoryId, setSelectedCategory } = useCategory();
  const { setSearchKeyword } = useSearch();

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    categoryService.getCategories().then(r => setCategories(r.data.result || [])).catch(() => { });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const kw = searchInput.trim();
    setSearchKeyword(kw || null);
    navigate(ROUTES.CONCERTS);
  };

  const handleCategoryChange = (id: string, name: string) => {
    setSelectedCategory(id || null, name || null);
    navigate(ROUTES.CONCERTS);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate(ROUTES.HOME);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path: string) => clsx(
    'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
    isActive(path)
      ? 'text-primary bg-primary/8 font-semibold'
      : 'text-gray-600 hover:text-primary hover:bg-primary/5'
  );

  return (
    <>
      <header className={clsx(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled ? 'glass shadow-md border-b border-white/60' : 'bg-white/90 backdrop-blur-sm border-b border-gray-100'
      )}>
        <div className="section-container">
          <div className="flex items-center h-16 gap-4">

            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center gap-2 flex-shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-md group-hover:shadow-glow-primary transition-all duration-300">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-gradient-primary hidden sm:block">ShowPass</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 ml-2">
              <Link to={ROUTES.HOME} className={navLinkClass('/')}>Home</Link>
              <Link to={ROUTES.CONCERTS} className={navLinkClass('/concerts')}>Concerts</Link>
              {isLoggedIn && (
                <Link to={ROUTES.MY_BOOKINGS} className={navLinkClass('/my-bookings')}>My Bookings</Link>
              )}
            </nav>

            {/* Category filter
            <div className="hidden lg:flex items-center">
              <select
                value={selectedCategoryId || ''}
                onChange={e => {
                  const cat = categories.find(c => c.id === e.target.value);
                  handleCategoryChange(e.target.value, cat?.name || '');
                }}
                className="text-sm text-gray-600 border-none bg-transparent focus:outline-none focus:ring-0 cursor-pointer hover:text-primary transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div> */}

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs items-center">
              <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search concerts..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200"
                />
              </div>
            </form>

            {/* Auth / User */}
            <div className="flex items-center gap-2 ml-auto">
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                      {(user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user?.email}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-slide-up">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs text-gray-500">Signed in as</p>
                          <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
                        </div>
                        <Link to={ROUTES.MY_BOOKINGS} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                          My Bookings
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link to={ROUTES.LOGIN} className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary border border-gray-200 rounded-xl hover:border-primary/40 transition-all duration-200">
                    Sign In
                  </Link>
                  <Link to={ROUTES.REGISTER} className="btn-gradient text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm">
                    Get Tickets
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search concerts..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-slide-up">
            <div className="section-container py-4 space-y-1">
              <Link to={ROUTES.HOME} className={clsx('block', navLinkClass('/'))}>Home</Link>
              <Link to={ROUTES.CONCERTS} className={clsx('block', navLinkClass('/concerts'))}>Concerts</Link>
              {isLoggedIn && (
                <Link to={ROUTES.MY_BOOKINGS} className={clsx('block', navLinkClass('/my-bookings'))}>My Bookings</Link>
              )}
              <div className="pt-2 border-t border-gray-100">
                <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categories</p>
                <button onClick={() => handleCategoryChange('', '')} className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg">
                  All Categories
                </button>
                {categories.map(c => (
                  <button key={c.id} onClick={() => handleCategoryChange(c.id, c.name)} className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg">
                    {c.name}
                  </button>
                ))}
              </div>
              {!isLoggedIn && (
                <div className="pt-2 border-t border-gray-100 flex gap-2">
                  <Link to={ROUTES.LOGIN} className="flex-1 text-center py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-700">Sign In</Link>
                  <Link to={ROUTES.REGISTER} className="flex-1 text-center py-2 text-sm font-medium btn-gradient text-white rounded-xl">Get Tickets</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CategoryProvider } from './context/CategoryContext';
import { SearchProvider } from './context/SearchContext';
import { AppHeader } from './components/layout/AppHeader';
import { AppFooter } from './components/layout/AppFooter';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ROUTES } from './constants/routes';

// ===== Lazy-loaded User Pages =====
const HomePage = lazy(() => import('./pages/user/HomePage').then(m => ({ default: m.HomePage })));
const ConcertsPage = lazy(() => import('./pages/user/ConcertsPage').then(m => ({ default: m.ConcertsPage })));
const ConcertDetailPage = lazy(() => import('./pages/user/ConcertDetailPage').then(m => ({ default: m.ConcertDetailPage })));
const SeatSelectionPage = lazy(() => import('./pages/user/SeatSelectionPage').then(m => ({ default: m.SeatSelectionPage })));
const CheckoutConfirmationPage = lazy(() => import('./pages/user/CheckoutConfirmationPage').then(m => ({ default: m.CheckoutConfirmationPage })));
const LoginPage = lazy(() => import('./pages/user/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/user/RegisterPage').then(m => ({ default: m.RegisterPage })));
const MyBookingsPage = lazy(() => import('./pages/user/MyBookingsPage').then(m => ({ default: m.MyBookingsPage })));

// ===== Lazy-loaded Admin Pages =====
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminConcerts = lazy(() => import('./pages/admin/AdminConcerts').then(m => ({ default: m.AdminConcerts })));
const AdminTickets = lazy(() => import('./pages/admin/AdminTickets').then(m => ({ default: m.AdminTickets })));
const AdminVouchers = lazy(() => import('./pages/admin/AdminVouchers').then(m => ({ default: m.AdminVouchers })));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings').then(m => ({ default: m.AdminBookings })));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminRoles = lazy(() => import('./pages/admin/AdminRoles').then(m => ({ default: m.AdminRoles })));
const AdminPermissions = lazy(() => import('./pages/admin/AdminPermissions').then(m => ({ default: m.AdminPermissions })));

// ===== Page Loading Fallback =====
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  </div>
);

// ===== User Layout Shell =====
const UserShell: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <AppHeader />
    <main className="flex-1">
      <Outlet />
    </main>
    <AppFooter />
  </div>
);

// ===== Legacy redirect helpers =====
// MUST be defined before App (const is not hoisted)
const LegacyConcertRedirect: React.FC = () => {
  const { id } = useParams();
  return <Navigate to={`/concerts/${id}`} replace />;
};

// Redirect old showtimes URLs directly to seat selection
const LegacyShowtimesRedirect: React.FC = () => {
  const { movieId, concertId } = useParams();
  const id = concertId || movieId;
  return <Navigate to={`/concerts/${id}/seats`} replace />;
};

// Redirect old seat selection URL (had showtime in path) to concert-level seat selection
const LegacySeatsRedirect: React.FC = () => {
  const { movieId, concertId } = useParams();
  const id = concertId || movieId;
  return <Navigate to={`/concerts/${id}/seats`} replace />;
};

// ===== App =====
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AuthProvider>
          <CategoryProvider>
            <SearchProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* ===== USER ROUTES ===== */}
                  <Route element={<UserShell />}>
                    <Route path={ROUTES.HOME} element={<HomePage />} />
                    <Route path={ROUTES.CONCERTS} element={<ConcertsPage />} />
                    <Route path="/concerts/:concertId" element={<ConcertDetailPage />} />

                    {/* Seat selection — uses concertId only (no showtime) */}
                    <Route path="/concerts/:concertId/seats" element={<SeatSelectionPage />} />

                    <Route path={ROUTES.CHECKOUT} element={<CheckoutConfirmationPage />} />
                    <Route path={ROUTES.MY_BOOKINGS} element={<MyBookingsPage />} />
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

                    {/* Legacy redirects — old URLs map to new concert-based URLs */}
                    <Route path="/movies" element={<Navigate to={ROUTES.CONCERTS} replace />} />
                    <Route path="/movie/:id" element={<LegacyConcertRedirect />} />
                    <Route path="/movie/:movieId/showtimes" element={<LegacyShowtimesRedirect />} />
                    <Route path="/movie/:movieId/showtime/:showtimeId/seats" element={<LegacySeatsRedirect />} />
                    <Route path="/concerts/:concertId/showtimes" element={<LegacyShowtimesRedirect />} />
                    <Route path="/concerts/:concertId/showtimes/:showtimeId/seats" element={<LegacySeatsRedirect />} />
                    <Route path="/booking-confirmation" element={<Navigate to={ROUTES.CHECKOUT} replace />} />
                    <Route path="/my-tickets" element={<Navigate to={ROUTES.MY_BOOKINGS} replace />} />
                  </Route>

                  {/* ===== ADMIN ROUTES ===== */}
                  <Route path={ROUTES.ADMIN.LOGIN} element={<AdminLoginPage />} />
                  <Route path="/admin" element={<DashboardLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="concerts" element={<AdminConcerts />} />
                    <Route path="tickets" element={<AdminTickets />} />
                    <Route path="vouchers" element={<AdminVouchers />} />
                    <Route path="bookings" element={<AdminBookings />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="roles" element={<AdminRoles />} />
                    <Route path="permissions" element={<AdminPermissions />} />

                    {/* Legacy admin redirects */}
                    <Route path="movies" element={<Navigate to={ROUTES.ADMIN.CONCERTS} replace />} />
                    <Route path="rooms" element={<Navigate to={ROUTES.ADMIN.CONCERTS} replace />} />
                    <Route path="venues" element={<Navigate to={ROUTES.ADMIN.CONCERTS} replace />} />
                    <Route path="showtimes" element={<Navigate to={ROUTES.ADMIN.CONCERTS} replace />} />
                  </Route>

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
                </Routes>
              </Suspense>
            </SearchProvider>
          </CategoryProvider>
        </AuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
};

export default App;
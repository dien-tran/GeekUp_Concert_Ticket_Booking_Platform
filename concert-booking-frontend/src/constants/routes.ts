// ===== Application Routes =====
export const ROUTES = {
  HOME: '/',
  CONCERTS: '/concerts',
  CONCERT_DETAIL: (concertId: string) => `/concerts/${concertId}`,
  CONCERT_SEATS: (concertId: string) => `/concerts/${concertId}/seats`,
  // Legacy: concert showtimes — redirects to seat selection
  CONCERT_SHOWTIMES: (concertId: string) => `/concerts/${concertId}/seats`,
  SEAT_SELECTION: (concertId: string, _showtimeId?: string) => `/concerts/${concertId}/seats`,
  CHECKOUT: '/checkout/confirmation',
  MY_BOOKINGS: '/my-bookings',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: {
    ROOT: '/admin',
    LOGIN: '/admin/login',
    DASHBOARD: '/admin',
    CONCERTS: '/admin/concerts',
    TICKETS: '/admin/tickets',
    VOUCHERS: '/admin/vouchers',
    BOOKINGS: '/admin/bookings',
    USERS: '/admin/users',
    ROLES: '/admin/roles',
    PERMISSIONS: '/admin/permissions',
    // Legacy
    VENUES: '/admin/concerts',
    SHOWTIMES: '/admin/concerts',
  },
} as const;

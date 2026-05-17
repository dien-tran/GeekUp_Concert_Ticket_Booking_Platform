import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL, AUTH_TOKEN_CLEARED_EVENT, createTokenStorage, createApiClient } from './api';
import { APIResponse } from '../types';

// ===== Admin Token Storage =====
const ADMIN_TOKEN_KEY = 'adminAccessToken';
export const adminTokenStorage = createTokenStorage(ADMIN_TOKEN_KEY);

const adminApi = createApiClient({ tokenStorage: adminTokenStorage });
const adminAxios = adminApi.instance;
export const adminAuthService = adminApi.auth;

// ===== Admin Concert Service =====
export const adminConcertService = {
  getConcerts: () => adminAxios.get<APIResponse<any[]>>('/concerts'),
  getConcertById: (id: string) => adminAxios.get<APIResponse<any>>(`/concerts/${id}`),
  createConcert: (data: any) => adminAxios.post<APIResponse<any>>('/concerts', data),
  updateConcert: (id: string, data: any) => adminAxios.put<APIResponse<any>>(`/concerts/${id}`, data),
  deleteConcert: (id: string) => adminAxios.delete<APIResponse<any>>(`/concerts/${id}`),
};

// ===== Admin Ticket Service =====
export const adminTicketService = {
  getAllTickets: () => adminAxios.get<APIResponse<any[]>>('/tickets'),
  getTicketsByConcert: (concertId: string) => adminAxios.get<APIResponse<any[]>>(`/tickets/concerts/${concertId}`),
  getTicketById: (id: string) => adminAxios.get<APIResponse<any>>(`/tickets/${id}`),
  createTicketCategory: (data: any) => adminAxios.post<APIResponse<any>>('/tickets', data),
  updateTicketCategory: (id: string, data: any) => adminAxios.put<APIResponse<any>>(`/tickets/${id}`, data),
  generateSeats: (categoryId: string) => adminAxios.post<APIResponse<any>>(`/tickets/${categoryId}/generate-seats`),
};

// ===== Admin Voucher Service =====
export const adminVoucherService = {
  getAllVouchers: () => adminAxios.get<APIResponse<any[]>>('/vouchers'),
  getVoucherById: (id: string) => adminAxios.get<APIResponse<any>>(`/vouchers/${id}`),
  getVouchersByConcert: (concertId: string) => adminAxios.get<APIResponse<any[]>>(`/vouchers/concerts/${concertId}`),
  createVoucher: (data: any) => adminAxios.post<APIResponse<any>>('/vouchers', data),
  updateVoucher: (id: string, data: any) => adminAxios.put<APIResponse<any>>(`/vouchers/${id}`, data),
};

// ===== Admin Booking Service =====
export const adminBookingService = {
  getAllBookings: () => adminAxios.get<APIResponse<any[]>>('/bookings/admin'),
  confirmBooking: (id: string) => adminAxios.patch<APIResponse<any>>(`/bookings/${id}/confirm`),
  cancelBooking: (id: string) => adminAxios.delete<APIResponse<any>>(`/bookings/${id}`),
  scanQr: (token: string) => adminAxios.post<APIResponse<any>>('/bookings/scanQr', { token }),
};

// ===== Admin User Service =====
export const adminUserService = {
  getAllUsers: () => adminAxios.get<APIResponse<any[]>>('/users'),
  getUserById: (id: string) => adminAxios.get<APIResponse<any>>(`/users/${id}`),
  updateUser: (id: string, data: any) => adminAxios.put<APIResponse<any>>(`/users/${id}`, data),
  deleteUser: (id: string) => adminAxios.delete<APIResponse<any>>(`/users/${id}`),
  assignRole: (userId: string, data: { roles: string[] }) =>
    adminAxios.put<APIResponse<any>>(`/users/${userId}/roles`, data),
  updateUserStatus: (userId: string, data: any) =>
    adminAxios.patch<APIResponse<any>>(`/users/${userId}/status`, data),
};

// ===== Admin Role Service =====
export const adminRoleService = {
  getAllRoles: () => adminAxios.get<APIResponse<any[]>>('/roles'),
  getRoleByName: (name: string) => adminAxios.get<APIResponse<any>>(`/roles/${name}`),
  createRole: (data: any) => adminAxios.post<APIResponse<any>>('/roles', data),
  updateRole: (name: string, data: any) => adminAxios.put<APIResponse<any>>(`/roles/${name}`, data),
  deleteRole: (name: string) => adminAxios.delete<APIResponse<any>>(`/roles/${name}`),
};

// ===== Admin Permission Service =====
export const adminPermissionService = {
  getAllPermissions: () => adminAxios.get<APIResponse<any[]>>('/permissions'),
  createPermission: (data: any) => adminAxios.post<APIResponse<any>>('/permissions', data),
  updatePermission: (name: string, data: any) => adminAxios.put<APIResponse<any>>(`/permissions/${name}`, data),
  deletePermission: (name: string) => adminAxios.delete<APIResponse<any>>(`/permissions/${name}`),
};

// ===== Admin Venue/Showtime Service (stubs — no backend API) =====
export const adminVenueService = {
  getVenues: () => Promise.resolve({ data: { result: [], message: 'No venue API in backend' } }),
  createVenue: (data: any) => Promise.reject(new Error('No venue API in backend')),
  updateVenue: (id: string, data: any) => Promise.reject(new Error('No venue API in backend')),
  deleteVenue: (id: string) => Promise.reject(new Error('No venue API in backend')),
};

export const adminShowtimeService = {
  getShowtimes: (): Promise<any> => Promise.resolve({ data: { result: [], message: 'No showtime API in backend' } }),
  getAllShowtimes: (): Promise<any> => Promise.resolve({ data: { result: [] } }),
  createShowtime: (data: any): Promise<any> => Promise.reject(new Error('No showtime API in backend')),
  updateShowtime: (id: string, data: any): Promise<any> => Promise.reject(new Error('No showtime API in backend')),
  deleteShowtime: (id: string): Promise<any> => Promise.reject(new Error('No showtime API in backend')),
  getSeatsByShowtime: (id: string): Promise<any> => Promise.resolve({ data: { result: [] } }),
  updateSeatPrice: (showtimeId: string, seatType: string, price: number): Promise<any> =>
    Promise.reject(new Error('No showtime API in backend')),
};

// ===== Backward-compat aliases for old admin page imports =====
export const adminMovieService = {
  ...adminConcertService,
  getAllMovies: () => adminConcertService.getConcerts(),
  createMovie: (data: any) => adminConcertService.createConcert(data),
  updateMovie: (id: string, data: any) => adminConcertService.updateConcert(id, data),
  deleteMovie: (id: string) => adminConcertService.deleteConcert(id),
  getMovieById: (id: string) => adminConcertService.getConcertById(id),
};
export const adminRoomService = {
  ...adminVenueService,
  getAllRooms: (): Promise<any> => Promise.resolve({ data: { result: [] } }),
  createRoom: (data: any): Promise<any> => Promise.reject(new Error('No room API')),
  updateRoom: (id: string, data: any): Promise<any> => Promise.reject(new Error('No room API')),
  deleteRoom: (id: string): Promise<any> => Promise.reject(new Error('No room API')),
};
export const adminGenreService = {
  getAllGenres: () => Promise.resolve({ data: { result: [] } }),
  createGenre: (name: string) => Promise.reject(new Error('No genre API')),
};
export const adminCloudinaryService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const token = adminTokenStorage.get();
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.text(); // backend returns plain URL string
  },
};

export default adminAxios;

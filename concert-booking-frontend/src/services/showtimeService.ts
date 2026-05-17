// showtimeService.ts — stub file for backward compatibility
// The backend has NO Showtime, Venue/Room, SeatShowtime, or SeatHold API.
// These stubs prevent 404 errors and import failures in legacy components.

import { ticketService } from './ticketService';

/** Legacy holdService stub — maps to ticket hold */
export const holdService = {
  holdSeats: async (data: any) => {
    // There is no seat-hold API. Return a mock response so legacy code doesn't crash.
    console.warn('[holdService.holdSeats] No seat-hold API in backend. Use ticketService.holdTickets instead.');
    return { data: { result: null, message: 'Use ticketService.holdTickets' } };
  },
  releaseHold: async (ids: string[]) => {
    console.warn('[holdService.releaseHold] No seat-hold release API in backend.');
    return { data: { result: null } };
  },
};

/** Legacy showtimeService stub */
export const showtimeService = {
  getShowtimes: async () => ({ data: { result: [] } }),
  getAllShowtimes: async () => ({ data: { result: [] } }),
  getShowtimeById: async (id: string) => ({ data: { result: null } }),
  getShowtimeByIdForUser: async (id: string) => ({ data: { result: null } }),
  getShowtimesByMovie: async (movieId: string) => ({ data: { result: [] } }),
  getSeatsByShowtime: async (showtimeId: string) => ({ data: { result: [] } }),
  createShowtime: async (data: any) => ({ data: { result: null } }),
  updateShowtime: async (id: string, data: any) => ({ data: { result: null } }),
  deleteShowtime: async (id: string) => ({ data: { result: null } }),
  // Redirect seat loading to the actual ticket endpoint
  getTicketsByConcert: ticketService.getTicketsByConcert,
};

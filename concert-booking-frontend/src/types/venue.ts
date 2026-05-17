// venue.ts — legacy stub only (no venue/room API in backend)
// Keep for backward compat with any remaining legacy imports

export interface Seat {
  id: string;
  seatRow: string;
  seatNumber: string;
  status: 'AVAILABLE' | 'BOOKED' | 'RESERVED';
  version: number;
}

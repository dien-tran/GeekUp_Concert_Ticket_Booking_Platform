// showtime.ts — legacy backward-compat stubs only
// The backend has NO Showtime/Venue/Room/SeatShowtime API.
// These types are kept to avoid breaking legacy component imports.

export interface Showtime {
  id: string;
  concertId: string;
  movieId?: string;
  venueId?: string;
  roomId?: string;
  venueName?: string;
  roomName?: string;
  startTime: string;
  endTime?: string;
  status?: string;
  availableSeats?: number;
  totalSeats?: number;
}

export interface ShowtimeDetail extends Showtime {
  concert?: any;
  venue?: any;
  movie?: any;
  room?: any;
}

export interface SeatShowtime {
  id: string;
  seatCode: string;
  status: string;
  seatType: string;
  price: number;
  holdExpireTime?: string;
  heldByUserEmail?: string;
}

export interface SeatShowtimeSummary {
  row: string;
  seats: SeatShowtime[];
}

export interface HoldSeatRequest {
  seatShowTimeIds: string[];
  showTimeId: string;
  userId: string;
  holdDuration: number;
}

export interface HoldSeatResponse {
  heldSeatCodes: string[];
  holdDurationSeconds: number;
  totalPrice: number;
  showTimeId?: string;
  userEmail?: string;
  holdStartTime?: number;
}

export interface ShowtimeCreateRequest {
  movieId?: string;
  roomId?: string;
  startTime?: string;
}

export interface Venue {
  id: string;
  name: string;
  capacity?: number;
}

// Legacy aliases
export type ShowTimeResponse = Showtime;
export type ShowTimeDetail = ShowtimeDetail;
export type SeatShowTimeResponse = SeatShowtime;

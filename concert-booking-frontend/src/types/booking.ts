// ===== Booking — matches backend BookingResponse =====
export interface Booking {
  bookingId: string;
  userId: string;
  concertId: string;
  bookingTime: string;        // ISO datetime
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  totalPrice: number;
  qrToken?: string;
  qrStatus?: 'PENDING' | 'ACTIVE' | 'USED' | 'INVALID';
  qrExpired?: number;         // minutes
  ticketIds: string[];
  seatCodes: string[];        // e.g. ["A1", "B3"]
  // Enriched fields (added by frontend for display)
  concertTitle?: string;
}

// ===== Booking Create Request — matches backend BookingRequest =====
export interface BookingCreateRequest {
  concertId: string;
  ticketIds: string[];
  voucherCode?: string;
  // userId is injected server-side from JWT — do NOT send from frontend
}

// ===== Display Helpers =====
export const BOOKING_STATUS_LABELS: Record<Booking['status'], string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
};

export const BOOKING_STATUS_COLORS: Record<Booking['status'], string> = {
  PENDING: 'text-amber-600 bg-amber-50 border-amber-200',
  CONFIRMED: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  CANCELLED: 'text-red-600 bg-red-50 border-red-200',
};

// Legacy alias for backward compat
export interface BookingRequest extends BookingCreateRequest {}

// ===== Ticket — individual seat (from Ticket entity) =====
// Returned inside TicketCategoryResponse.tickets[]
export interface Ticket {
  id: string;
  seatNumber: string;  // e.g. "A1", "B3"
  reserved: boolean;
  status: 'AVAILABLE' | 'HOLD' | 'BOOKED' | string;
}

// ===== TicketCategory — matches backend TicketCategoryResponse =====
export interface TicketCategory {
  id: string;
  concertId: string;
  name: string;             // e.g. "VIP", "Standard"
  price: number;
  totalQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
  status: string;           // "AVAILABLE", "SOLD_OUT", etc.
  tickets: Ticket[];        // individual seat slots
}

// ===== Ticket Category Create Request — matches TicketCategoryRequest =====
export interface TicketCategoryCreateRequest {
  concertId: string;
  name: string;
  price: number;
  totalQuantity: number;
  status?: string;
}

export interface TicketCategoryUpdateRequest {
  name: string;
  price: number;
  totalQuantity: number;
  status?: string;
}

// ===== Hold Request — matches HoldTicketRequest =====
export interface HoldTicketRequest {
  ticketIds: string[];
  concertId: string;
  userId: string;
  holdDuration: number;   // minutes, 1–15
}

// ===== Hold Response — matches HoldTicketResponse =====
export interface HoldTicketResponse {
  heldTicketIds: string[];
  concertId: string;
  userEmail: string;
  holdDurationSeconds: number;
  totalPrice: number;
}

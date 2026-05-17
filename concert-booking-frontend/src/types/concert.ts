// ===== Concert — matches backend ConcertResponse =====
export interface Concert {
  id: string;
  title: string;
  description: string;
  duration: number;          // minutes
  status: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED';
  posterUrl: string;         // Backend field: posterUrl
  openDate?: string;         // ISO datetime string
  startTime?: string;        // ISO datetime string

  // Backward-compat: old frontend pages used imageUrl
  imageUrl?: string;         // mapped from posterUrl
  releaseDate?: string;      // mapped from openDate
  // Optional media (not in backend but kept for UI flexibility)
  trailerUrl?: string;
  director?: string;
  actors?: string;
  categoryNames?: string[];
  // Backward-compat: old MovieCard/MovieDetail/MoviesCatalog used genreNames and genreIds
  genreNames?: string[];
  genreIds?: string[];
  // Concert catalog filters
  categoryIds?: string[];
}

// ===== Concert Create/Update Request — matches backend ConcertRequest =====
export interface ConcertCreateRequest {
  title: string;
  description?: string;
  duration: number;          // required, min 1
  status?: string;
  posterUrl?: string;
  openDate?: string;         // ISO datetime string
  startTime?: string;        // ISO datetime string
  totalTickets: number;      // required
  standardPrice: number;     // required
  vipPrice: number;          // required
  standardQuantity: number;  // required
  vipQuantity: number;       // required
}

export interface ConcertUpdateRequest extends ConcertCreateRequest {}

// ===== Category =====
export interface Category {
  id: string;
  name: string;
}

// ===== Status Helpers =====
export const CONCERT_STATUS_LABELS: Record<Concert['status'], string> = {
  NOW_SHOWING: 'Live Events',
  COMING_SOON: 'Upcoming Events',
  ENDED: 'Past Events',
};

export const CONCERT_STATUS_COLORS: Record<Concert['status'], string> = {
  NOW_SHOWING: 'status-live',
  COMING_SOON: 'status-upcoming',
  ENDED: 'status-ended',
};

// Helper to normalize Concert from backend (maps posterUrl → imageUrl, openDate → releaseDate)
export const normalizeConcert = (raw: any): Concert => ({
  ...raw,
  imageUrl: raw.posterUrl || raw.imageUrl || '',
  releaseDate: raw.openDate || raw.releaseDate || '',
});

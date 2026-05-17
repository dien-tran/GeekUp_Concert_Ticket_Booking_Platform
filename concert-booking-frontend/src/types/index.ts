// Barrel re-export of all domain types
export * from './concert';
export * from './ticket';
export * from './voucher';
export * from './booking';
export * from './auth';
export * from './admin';
export * from './showtime';

// ===== Generic API Response =====
export interface APIResponse<T> {
  result: T;
  code?: string | number;
  message?: string;
}

export interface ErrorResponse {
  message: string;
  status: number;
  timestamp: string;
}
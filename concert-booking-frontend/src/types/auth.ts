// ===== Auth =====
export interface AuthenticationRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  token: string;
}

export interface LogoutRequest {
  token?: string;
}

export interface AuthenticationResult {
  token: string;
  isAuthenticated: boolean;
}

// ===== User =====
export interface User {
  email: string;
  fullName?: string;
}

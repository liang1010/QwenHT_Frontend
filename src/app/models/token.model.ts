export interface LoginResponse {
  token: string;
  expiration: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiration: string;
  refreshToken: string;
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, timer, EMPTY } from 'rxjs';
import { map, catchError, switchMap, shareReplay, filter, take, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from '../models/token.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private router: Router
  ) {
    const token = localStorage.getItem('access_token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.currentUserSubject.next(this.jwtHelper.decodeToken(token));
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/account/login`, { username, password }).pipe(
      map(response => {
        if (response.token) {
          localStorage.setItem('access_token', response.token);
          localStorage.setItem('refresh_token', response.refreshToken);
          this.currentUserSubject.next(this.jwtHelper.decodeToken(response.token));
        }
        return response;
      })
    );
  }

  logout(): void {
    console.log("AuthService: Logging out due to token failure or user action.");
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    // Use navigateByUrl with skipLocationChange to avoid potential issues with guards
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return token != null && !this.jwtHelper.isTokenExpired(token);
  }

  isAuthenticatedAsync(): Observable<boolean> {
    const token = localStorage.getItem('access_token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return of(true);
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      return this.refreshToken().pipe(
        map(() => true),
        catchError(() => {
          // Refresh failed, logout handled within refreshToken
          return of(false);
        })
      );
    }

    return of(false);
  }

  // Refresh access token
  refreshToken(): Observable<string> {
    // If already refreshing, wait for the ongoing refresh to complete
    if (this.isRefreshing) {
      console.log("AuthService: Refresh already in progress, waiting...");
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null), // Wait for the token to be set
        take(1), // Take the first valid token
        switchMap(token => {
          if (token) {
            console.log("AuthService: Using token from ongoing refresh.");
            return of(token);
          } else {
             // If the ongoing refresh failed and subject is reset to null, this indicates failure
             console.error("AuthService: Ongoing refresh failed, logging out.");
             this.logout();
             return throwError(() => new Error('Session expired'));
          }
        })
      );
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.error("AuthService: No refresh token found, logging out.");
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null); // Reset subject while refreshing

    const request: RefreshTokenRequest = { refreshToken };

    console.log("AuthService: Attempting to refresh token...");
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/account/refresh-token`, request).pipe(
      map(response => {
        if (response.token && response.refreshToken) { // Ensure both tokens are present
          localStorage.setItem('access_token', response.token);
          localStorage.setItem('refresh_token', response.refreshToken);
          this.currentUserSubject.next(this.jwtHelper.decodeToken(response.token));
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.token);
          console.log("AuthService: Token refreshed successfully.");
          return response.token;
        } else {
          console.error("AuthService: Refresh response missing token or refreshToken.");
          throw new Error('Invalid refresh token response');
        }
      }),
      catchError(err => {
        console.error("AuthService: Refresh token request failed:", err);
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null); // Signal failure
        this.logout(); // Logout on refresh failure
        return throwError(() => err);
      })
      // Removed shareReplay to avoid caching errors
    );
  }


  getUserName(): string {
    const token = localStorage.getItem('access_token');
    if (!token) return '';
    const decoded = this.jwtHelper.decodeToken(token);
    return decoded['username'] || decoded['email'] || 'User';
  }

  getRoles(): string[] {
    const token = localStorage.getItem('access_token');
    if (!token) return [];
    const decoded = this.jwtHelper.decodeToken(token);
    const roles = decoded['roles'];
    return Array.isArray(roles) ? roles : typeof roles === 'string' ? [roles] : [];
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

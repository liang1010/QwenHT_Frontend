import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap, shareReplay } from 'rxjs/operators';
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

  // Flag to track if a token refresh is in progress
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private router: Router
  ) {
    // Check if there's a token on service initialization
    const token = localStorage.getItem('access_token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.currentUserSubject.next(decodedToken);
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/account/login`, {
      username: username,
      password: password
    }).pipe(
      map(response => {
        if (response.token) {
          // Store tokens in local storage
          localStorage.setItem('access_token', response.token);
          localStorage.setItem('refresh_token', response.refreshToken);

          // Decode the token and update user subject
          const decodedToken = this.jwtHelper.decodeToken(response.token);
          this.currentUserSubject.next(decodedToken);
        }
        return response;
      })
    );
  }

  register(firstName: string, lastName: string, email: string, password: string, role?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/account/register`, {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      role: role
    });
  }

  logout(): Observable<any> {
    // Clear tokens from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);

    return of(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return true;
    }

    // If access token is expired, check if we can refresh it
    return this.tryRefreshTokenSync();
  }

  private tryRefreshTokenSync(): boolean {
    const refreshToken = localStorage.getItem('refresh_token');
    // We just need to check if a refresh token exists, as it's not a JWT token and we can't check its expiry locally
    return !!refreshToken;
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
          // If refresh token is also invalid/expired, clear tokens and redirect
          this.logout().subscribe();
          this.router.navigate(['/auth/login']);
          return of(false);
        })
      );
    }

    return of(false);
  }

  refreshToken(): Observable<any> {
    if (this.isRefreshing) {
      // If already refreshing, wait for the refresh to complete
      return this.refreshTokenSubject.pipe(
        switchMap(token => {
          if (token) {
            return of(token);
          } else {
            this.router.navigate(['/auth/login']);
            return throwError(() => new Error('Session expired'));
          }
        })
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.isRefreshing = false;
      this.logout().subscribe();
      this.router.navigate(['/auth/login']);
      return throwError(() => new Error('No refresh token'));
    }

    const refreshTokenRequest: RefreshTokenRequest = {
      refreshToken: refreshToken
    };

    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/account/refresh-token`, refreshTokenRequest).pipe(
      map(response => {
        if (response.token) {
          // Store new tokens
          localStorage.setItem('access_token', response.token);
          localStorage.setItem('refresh_token', response.refreshToken);

          // Update current user
          const decodedToken = this.jwtHelper.decodeToken(response.token);
          this.currentUserSubject.next(decodedToken);

          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.token);
          return response;
        } else {
          throw new Error('Invalid refresh token response');
        }
      }),
      catchError(error => {
        this.isRefreshing = false;
        this.logout().subscribe();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      }),
      shareReplay() // Cache the result to avoid multiple refresh attempts
    );
  }

  getUserName(): string {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      // Use the full WS-Federation claim names
      // http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name is the proper name claim
      // http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress is the email claim
      return decodedToken['username'] ||
             decodedToken['email'] ||
             'User';
    }
    return '';
  }

  getRoles(): string[] {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      // Handle both single role and multiple roles
      const roles = decodedToken['roles'];
      if (Array.isArray(roles)) {
        return roles;
      } else if (typeof roles === 'string') {
        return [roles];
      }
    }
    return [];
  }

  hasRole(role: string): boolean {
    const userRoles = this.getRoles();
    return userRoles.includes(role);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

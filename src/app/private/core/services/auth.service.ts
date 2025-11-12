import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.identityServerUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {
    // Check if there's a token on service initialization
    const token = localStorage.getItem('access_token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.currentUserSubject.next(decodedToken);
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/account/login`, {
      username: username,
      password: password
    });
  }

  register(firstName: string, lastName: string, email: string, password: string, role?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/account/register`, {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      role: role
    });
  }

  logout(): Observable<any> {
    // Call the backend logout endpoint if needed (for future use)
    // In JWT systems, logout is typically client-side only
    // but we can still call a server endpoint to handle server-side tokens if implemented
    const token = localStorage.getItem('access_token');
    if (token) {
      // Optional: call an API endpoint to invalidate the token on the server
      // This would be useful if we implement a token blacklist on the server
      // For now, we just clear the local storage
      localStorage.removeItem('access_token');
      this.currentUserSubject.next(null);
    }
    
    return new Observable(observer => {
      observer.next("");
      observer.complete();
    });
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  getUserName(): string {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      // Use the full WS-Federation claim names
      // http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name is the proper name claim
      // http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress is the email claim
      return decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
             decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 
             'User';
    }
    return '';
  }

  getRoles(): string[] {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      // Handle both single role and multiple roles
      const roles = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
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
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { NavigationItem } from '../models/navigation-item';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private apiUrl = `${environment.apiUrl}/navigation`;
  private cachedNavigationItems: NavigationItem[] | null = null;
  private isNavigationLoaded = false;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getUserNavigation(): Observable<NavigationItem[]> {
    // if (this.cachedNavigationItems && this.isNavigationLoaded) {
    //   // Return cached data
    //   return of([...this.cachedNavigationItems]); // Return a copy to prevent accidental mutations
    // }

    // Fetch fresh data from API
    return new Observable(observer => {
      this.http.get<NavigationItem[]>(`${this.apiUrl}/user`).subscribe({
        next: (data) => {
          this.cachedNavigationItems = data;
          this.isNavigationLoaded = true;
          observer.next([...data]); // Return a copy
          observer.complete();
        },
        error: (error) => {
          // If it's an unauthorized error, clear the cache and redirect
          if (error instanceof HttpErrorResponse && error.status === 401) {
            // Token may have expired, clear cache and let auth interceptor handle redirect
            this.clearCache();
            this.authService.logout();
          }
          
          console.error('Error loading navigation:', error);
          // Return empty array if API call fails, but clear cache to try again later
          this.cachedNavigationItems = null; // Allow retry on next navigation
          this.isNavigationLoaded = false;
          observer.next([]);
          observer.complete();
        }
      });
    });
  }

  // Method to clear cache (e.g., when user logs out)
  clearCache(): void {
    this.cachedNavigationItems = null;
    this.isNavigationLoaded = false;
  }

  getAllNavigation(): Observable<NavigationItem[]> {
    return this.http.get<NavigationItem[]>(`${this.apiUrl}`);
  }

  getNavigationItem(id: number): Observable<NavigationItem> {
    return this.http.get<NavigationItem>(`${this.apiUrl}/${id}`);
  }

  createNavigationItem(item: Partial<NavigationItem>): Observable<NavigationItem> {
    return this.http.post<NavigationItem>(`${this.apiUrl}`, item);
  }

  updateNavigationItem(id: number, item: Partial<NavigationItem>): Observable<NavigationItem> {
    return this.http.put<NavigationItem>(`${this.apiUrl}/${id}`, item);
  }

  deleteNavigationItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NavigationItem } from '../models/navigation-item.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private apiUrl = `${environment.apiUrl}/navigation`;

  constructor(private http: HttpClient) { }

  getUserNavigation(): Observable<NavigationItem[]> {
    return this.http.get<NavigationItem[]>(`${this.apiUrl}/user`);
  }

  getAllNavigation(): Observable<NavigationItem[]> {
    return this.http.get<NavigationItem[]>(`${this.apiUrl}`);
  }

  getNavigationItem(id: string): Observable<NavigationItem> {
    return this.http.get<NavigationItem>(`${this.apiUrl}/${id}`);
  }

  createNavigationItem(item: NavigationItem): Observable<NavigationItem> {
    return this.http.post<NavigationItem>(`${this.apiUrl}`, item);
  }

  updateNavigationItem(id: string, item: NavigationItem): Observable<NavigationItem> {
    return this.http.put<NavigationItem>(`${this.apiUrl}/${id}`, item);
  }

  deleteNavigationItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignRoleToNavigation(navigationId: string, roleName: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${navigationId}/roles/${roleName}`, {});
  }

  removeRoleFromNavigation(navigationId: string, roleName: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${navigationId}/roles/${roleName}`);
  }
}
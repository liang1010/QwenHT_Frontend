import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Menu } from '../models/menu.model';
import { PaginatedResponse } from '../models/paginated-response';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = `${environment.apiUrl}/menus`;

  constructor(private http: HttpClient) { }

  getMenus(searchTerm?: string): Observable<Menu[]> {
    let params = new URLSearchParams();

    if (searchTerm) {
      params.set('searchTerm', searchTerm);
    }

    return this.http.get<Menu[]>(`${this.apiUrl}?${params.toString()}`);
  }

  getMenu(id: string): Observable<Menu> {
    return this.http.get<Menu>(`${this.apiUrl}/${id}`);
  }

  createMenu(menu: Menu): Observable<Menu> {
    return this.http.post<Menu>(this.apiUrl, menu);
  }

  updateMenu(id: string, menu: Menu): Observable<Menu> {
    return this.http.put<Menu>(`${this.apiUrl}/${id}`, menu);
  }

  deleteMenu(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getMenusPaginated(page: number, pageSize: number, sortField?: string, sortDirection?: string, searchTerm?: string): Observable<PaginatedResponse<Menu>> {
    let params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });

    if (sortField) {
      params.set('sortField', sortField);
    }

    if (sortDirection) {
      params.set('sortDirection', sortDirection);
    }

    if (searchTerm) {
      params.set('searchTerm', searchTerm);
    }

    return this.http.get<PaginatedResponse<Menu>>(`${this.apiUrl}/paginated?${params.toString()}`);
  }
}
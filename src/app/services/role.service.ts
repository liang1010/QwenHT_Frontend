import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role } from '../models/role.model';
import { PaginatedResponse } from '../models/paginated-response';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`; // Update with your API URL

  constructor(private http: HttpClient) { }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  updateRole(id: string, role: Role): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/${id}`, role);
  }

  deleteRole(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/delete`, {});
  }

  // Server-side pagination with sorting and search
  getRolesPaginated(page: number, pageSize: number, sortField?: string, sortDirection?: string, searchTerm?: string): Observable<PaginatedResponse<Role>> {
    const params = new URLSearchParams({
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

    return this.http.get<PaginatedResponse<Role>>(`${this.apiUrl}/paginated?${params.toString()}`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../models/paginated-response';
import { Staff } from '../models/staff.model';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private apiUrl = `${environment.apiUrl}/staff`; // Update with your API URL

  constructor(private http: HttpClient) { }

  getStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(this.apiUrl);
  }

  getStaffById(id: string): Observable<Staff> {
    return this.http.get<Staff>(`${this.apiUrl}/${id}`);
  }

  createStaff(staff: Staff): Observable<Staff> {
    return this.http.post<Staff>(this.apiUrl, staff);
  }

  updateStaff(id: string, staff: Staff): Observable<Staff> {
    return this.http.put<Staff>(`${this.apiUrl}/${id}`, staff);
  }

  deleteStaff(id?: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Server-side pagination with sorting and search
  getStaffPaginated(page: number, pageSize: number, sortField?: string, sortDirection?: string, searchTerm?: string): Observable<PaginatedResponse<Staff>> {
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

    return this.http.get<PaginatedResponse<Staff>>(`${this.apiUrl}/paginated?${params.toString()}`);
  }
}
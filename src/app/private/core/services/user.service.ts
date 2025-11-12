import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`; // Update with your API URL

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id?: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
  // Server-side pagination with sorting and search
  getUsersPaginated(page: number, pageSize: number, sortField?: string, sortDirection?: string, searchTerm?: string): Observable<PaginatedResponse<User>> {
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
    
    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/paginated?${params.toString()}`);
  }
  
  // Change user password
  changePassword(userId: string, currentPassword: string, newPassword: string, confirmNewPassword: string): Observable<any> {
    const body = {
      currentPassword,
      newPassword,
      confirmNewPassword
    };
    
    return this.http.post(`${this.apiUrl}/${userId}/change-password`, body);
  }
}
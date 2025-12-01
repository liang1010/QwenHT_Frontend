import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OptionValue } from '../models/option-value.model';
import { PaginatedResponse } from '../models/paginated-response';

@Injectable({
  providedIn: 'root'
})
export class OptionValueService {
  private apiUrl = `${environment.apiUrl}/optionvalues`;

  constructor(private http: HttpClient) { }

  getOptionValues(category?: string): Observable<OptionValue[]> {
    if (category) {
      return this.http.get<OptionValue[]>(`${this.apiUrl}?category=${encodeURIComponent(category)}`);
    }
    return this.http.get<OptionValue[]>(this.apiUrl);
  }

  getOptionValue(id: string): Observable<OptionValue> {
    return this.http.get<OptionValue>(`${this.apiUrl}/${id}`);
  }

  createOptionValue(optionValue: OptionValue): Observable<OptionValue> {
    return this.http.post<OptionValue>(this.apiUrl, optionValue);
  }

  updateOptionValue(id: string, optionValue: OptionValue): Observable<OptionValue> {
    return this.http.put<OptionValue>(`${this.apiUrl}/${id}`, optionValue);
  }

  deleteOptionValue(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Server-side pagination with sorting and search
  getOptionValuesPaginated(page: number, pageSize: number, sortField?: string, sortDirection?: string, searchTerm?: string): Observable<PaginatedResponse<OptionValue>> {
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

    return this.http.get<PaginatedResponse<OptionValue>>(`${this.apiUrl}/paginated?${params.toString()}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getAutocompleteOptions(category: string, searchTerm: string, limit: number = 10): Observable<OptionValue[]> {
    const params = new URLSearchParams({
      category: category,
      searchTerm: searchTerm,
      limit: limit.toString()
    });

    return this.http.get<OptionValue[]>(`${this.apiUrl}/autocomplete?${params.toString()}`);
  }
}
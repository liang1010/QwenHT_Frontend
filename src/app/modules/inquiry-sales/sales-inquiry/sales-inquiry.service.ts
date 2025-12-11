import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../models/paginated-response';
import { OptionValue } from '../../../models/option-value.model';

// Define the SalesRecord interface
export interface SalesRecord {
  id: string;
  salesDate: string; // ISO date string
  staffId: string;
  staffName: string;
  outlet: string;
  outletName: string;
  menuId: string;
  menuDescription: string;
  price: number;
  bodyMins: number;
  footMins: number;
  staffCommission: number;
  extraCommission: number;
  remark: string;
  request: boolean;
  footCream: boolean;
  oil: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SalesInquiryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get sales records with pagination and filtering
  getSalesRecords(
    filters: { startDate?: any | null; endDate?: Date | null; outlet?: string | null },
    offset: number = 0,
    limit: number = 20
  ): Observable<any> {  // Changed to any to handle the backend response structure
    // Construct query parameters based on filters
    let params = `offset=${offset}&limit=${limit}`;

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      const startDateStr = startDate.toISOString();
      params += `&startDate=${startDateStr}`;
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      const endDateStr = endDate.toISOString();
      params += `&endDate=${endDateStr}`;
    }
    if (filters.outlet) {
      params += `&outlet=${filters.outlet}`;
    }

    return this.http.get(`${this.apiUrl}/sales/inquiry?${params}`);
  }

  // Get available outlets for filtering
  getOutlets(): Observable<OptionValue[]> {
    return this.http.get<OptionValue[]>(`${this.apiUrl}/sales/outlet/active?category=${encodeURIComponent('OUTLET')}`);
  }

  // Update a sales record
  updateSalesRecord(record: SalesRecord): Observable<any> {
    return this.http.put(`${this.apiUrl}/sales/${record.id}`, record);
  }

  // Delete a sales record
  deleteSalesRecord(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sales/${id}`);
  }

  // Get a single sales record by ID
  getSalesRecordById(id: string): Observable<SalesRecord> {
    return this.http.get<SalesRecord>(`${this.apiUrl}/sales/${id}`);
  }
}

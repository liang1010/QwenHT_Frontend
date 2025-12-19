import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../models/paginated-response';
import { OptionValue } from '../../models/option-value.model';

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

export interface SalesPaginatedResponse extends PaginatedResponse<SalesRecord> {
  // Aggregates for the entire filtered dataset (not just the current page)
  aggregatePrice?: number;
  aggregateBodyMins?: number;
  aggregateFootMins?: number;
  aggregateStaffCommission?: number;
  aggregateExtraCommission?: number;
  aggregateRequest?: number;
  aggregateFootCream?: number;
  aggregateOil?: number;
  totalRecordsCount?: number; // Same as totalCount but more explicit
}

@Injectable({
  providedIn: 'root'
})
export class SalesInquiryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get sales records with pagination and filtering
  getSalesRecords(
    filters: { startDate?: any | null; endDate?: Date | null; outlet?: string | null },
    page: number = 1,
    pageSize: number = 10
  ): Observable<SalesPaginatedResponse> {
    // Construct query parameters based on filters
    let params = `page=${page}&pageSize=${pageSize}`;

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

    return this.http.get<SalesPaginatedResponse>(`${this.apiUrl}/sales-inquiry/inquiry?${params}`);
  }

  // Get available outlets for filtering
  getOutlets(): Observable<OptionValue[]> {
    return this.http.get<OptionValue[]>(`${this.apiUrl}/sales-inquiry/outlet/active?category=${encodeURIComponent('OUTLET')}`);
  }

  // Update a sales record
  updateSalesRecord(record: SalesRecord): Observable<any> {
    return this.http.post(`${this.apiUrl}/sales-inquiry/${record.id}`, record);
  }

  // Delete a sales record
  deleteSalesRecord(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sales-inquiry/${id}/delete`, {});
  }

  // Get a single sales record by ID
  getSalesRecordById(id: string): Observable<SalesRecord> {
    return this.http.get<SalesRecord>(`${this.apiUrl}/sales-inquiry/${id}`);
  }
}

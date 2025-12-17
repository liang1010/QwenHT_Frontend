import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SalesSummaryItem } from './sales-summary.model';
import { OptionValue } from '../../../models/option-value.model';

@Injectable({
  providedIn: 'root'
})
export class SalesSummaryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSalesSummary(
    startDate: Date,
    endDate: Date,
    category: string,
    outlet: string
  ): Observable<SalesSummaryItem[]> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      category: category,
      outlet: outlet
    });

    return this.http.get<SalesSummaryItem[]>(`${this.apiUrl}/sales/summary?${params.toString()}`);
  }

  getOutlets(): Observable<OptionValue[]> {
    return this.http.get<OptionValue[]>(`${this.apiUrl}/sales/outlet/active?category=${encodeURIComponent('OUTLET')}`);
  }
}
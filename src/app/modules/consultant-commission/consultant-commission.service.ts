import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Staff } from '../../models/staff.model';
import { Incentive } from '../../models/incentives';
import { ConsultantCommissionReportDto } from './consultant-commission.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultantCommissionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTherapistCommission(
    staffId: string,
    startDate: Date,
    endDate: Date,
    incentive: boolean
  ): Observable<any> { // Using any temporarily until we define the full response type
    const params = new URLSearchParams({
      staffId: staffId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      incentive: incentive.toString()
    });

    return this.http.get<ConsultantCommissionReportDto>(`${this.apiUrl}/commission/consultant?${params.toString()}`);
  }

  insertConsultantPayout(
    staffId: string,
    startDate: Date,
    endDate: Date
  ): Observable<any> { // Using any temporarily until we define the full response type
    const params = new URLSearchParams({
      staffId: staffId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    return this.http.get<[]>(`${this.apiUrl}/commission/consultant/insertPayout?${params.toString()}`);
  }

  getStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiUrl}/commission/consultant/staff/active`);
  }

  downloadTherapistCommissionReport(
    staffId: string,
    startDate: Date,
    endDate: Date
  ): Observable<Blob> {
    const params = new URLSearchParams({
      staffId: staffId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    return this.http.get(`${this.apiUrl}/commission/consultant/pdf?${params.toString()}`, {
      responseType: 'blob' // Important: Specify blob response type for PDF download
    });
  }
  createIncentive(menu: Incentive): Observable<Incentive> {
    return this.http.post<Incentive>(`${this.apiUrl}/commission/consultant/incentives`, menu);
  }

  updateIncentive(id: string, menu: Incentive): Observable<Incentive> {
    return this.http.post<Incentive>(`${this.apiUrl}/commission/consultant/incentives/${id}`, menu);
  }

  deleteIncentive(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/commission/consultant/incentives/${id}/delete`, {});
  }

  getOptionValuesByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/optionvalues?category=${category}`);
  }

}

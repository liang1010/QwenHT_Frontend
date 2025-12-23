import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TherapistCommissionItem, TherapistCommissionReportDto } from './therapist-commission.model';
import { environment } from '../../../environments/environment';
import { Staff } from '../../models/staff.model';
import { Incentive } from '../../models/incentives';

@Injectable({
  providedIn: 'root'
})
export class TherapistCommissionService {
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
      incentive:incentive.toString()
    });

    return this.http.get<TherapistCommissionReportDto>(`${this.apiUrl}/commission/therapist?${params.toString()}`);
  }

  getStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiUrl}/commission/therapist/staff/active`);
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

    return this.http.get(`${this.apiUrl}/commission/therapist/pdf?${params.toString()}`, {
      responseType: 'blob' // Important: Specify blob response type for PDF download
    });
  }
  createIncentive(menu: Incentive): Observable<Incentive> {
    return this.http.post<Incentive>(`${this.apiUrl}/commission/therapist/incentives`, menu);
  }

  updateIncentive(id: string, menu: Incentive): Observable<Incentive> {
    return this.http.post<Incentive>(`${this.apiUrl}/commission/therapist/incentives/${id}`, menu);
  }

  deleteIncentive(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/commission/therapist/incentives/${id}/delete`, {});
  }

}

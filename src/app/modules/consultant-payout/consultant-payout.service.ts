import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Staff } from '../../models/staff.model';
import { Incentive } from '../../models/incentives';
import { ConsultantPayoutReportDto } from './consultant-payout.model';

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
      incentive:incentive.toString()
    });

    return this.http.get<ConsultantPayoutReportDto[]>(`${this.apiUrl}/payout/consultant?${params.toString()}`);
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

    return this.http.get(`${this.apiUrl}/payout/consultant/pdf?${params.toString()}`, {
      responseType: 'blob' // Important: Specify blob response type for PDF download
    });
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TherapistCommissionItem } from './therapist-commission.model';
import { environment } from '../../../environments/environment';
import { Staff } from '../../models/staff.model';

@Injectable({
  providedIn: 'root'
})
export class TherapistCommissionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTherapistCommission(
    staffId: string,
    startDate: Date,
    endDate: Date
  ): Observable<TherapistCommissionItem[]> {
    const params = new URLSearchParams({
      staffId: staffId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    return this.http.get<TherapistCommissionItem[]>(`${this.apiUrl}/commission/therapist?${params.toString()}`);
  }

  getStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiUrl}/commission/therapist/staff/active`);
  }

}

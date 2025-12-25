import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Staff } from '../../models/staff.model';
import { Incentive } from '../../models/incentives';
import { OptionValue } from '../../models/option-value.model';

@Injectable({
  providedIn: 'root'
})
export class CommissionSettingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getOptionValue(): Observable<OptionValue[]> {
    return this.http.get<OptionValue[]>(`${this.apiUrl}/commission/setting`);
  }

  updateOptionValues(optionValues: OptionValue[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/commission/setting/update`, optionValues);
  }

  updateIncentive(id: string, menu: Incentive): Observable<Incentive> {
    return this.http.post<Incentive>(`${this.apiUrl}/commission/therapist/incentives/${id}`, menu);
  }

  deleteIncentive(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/commission/therapist/incentives/${id}/delete`, {});
  }

}

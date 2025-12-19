import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OptionValue } from '../../models/option-value.model';
import { Menu } from '../../models/menu.model';

export interface Staff {
  id: string;
  nickName: string | null;
  fullName: string;
}

export interface Outlet {
  name: string;
  code: string;
  // Add other relevant outlet properties based on your Outlet model
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  private apiUrl = environment.apiUrl; // Adjust this to your actual API URL

  constructor(private http: HttpClient) { }

  // Methods to fetch data from backend
  getStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiUrl}/sales-key-in/staff/active`);
  }

  getMenu(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.apiUrl}/sales-key-in/menu/active`);
  }

  getOutlets(): Observable<OptionValue[]> {

    return this.http.get<OptionValue[]>(`${this.apiUrl}/sales-key-in/outlet/active?category=${encodeURIComponent('OUTLET')}`);
  }

  // Method to save sales data
  saveSales(salesData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/sales-key-in`, salesData);
  }
}

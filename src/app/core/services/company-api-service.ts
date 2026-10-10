import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanyView } from '../../models/company.model';
import { API_ENDPOINTS } from '../config/api-endpoints'

@Injectable({
  providedIn: 'root',
})
export class CompanyApiService {
  private apiUrl = API_ENDPOINTS.companies;

  constructor(private http: HttpClient) {}

  findMyCompany(): Observable<CompanyView> {
    return this.http.get<CompanyView>(`${this.apiUrl}/me`);
  }
}

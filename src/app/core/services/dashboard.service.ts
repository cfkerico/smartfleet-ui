import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dashboard } from '../../models/dashboard.model'
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  private apiUrl = API_ENDPOINTS.dashboard;

  constructor(private http: HttpClient) {}

    getDashboard(): Observable<Dashboard> {
      console.log("+++++++++++++++++++++ ", this.apiUrl);
      return this.http.get<Dashboard>(this.apiUrl);
    }
  }

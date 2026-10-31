import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DashboardAnalytics} from '../../models/dashboard-analytics.model';
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private apiUrl = API_ENDPOINTS.analyticsDashboard;

  constructor(private http: HttpClient) {}

  getDashboard(from?: string, to?: string) {
    let params = new HttpParams();
    if (from && to) params = params.set('from', from).set('to', to);
    return this.http.get<DashboardAnalytics>(this.apiUrl, { params });
  }
}

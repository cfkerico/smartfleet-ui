import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DashboardAnalytics} from '../../models/dashboard-analytics.model';
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private apiUrl = API_ENDPOINTS.analiticsDashboard;

  constructor(private http: HttpClient) {}

  getDashboard() {
    return this.http.get<DashboardAnalytics>(this.apiUrl);
  }
}

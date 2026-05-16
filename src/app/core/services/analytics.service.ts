import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DashboardAnalytics} from '../../models/dashboard-analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private apiUrl = 'http://localhost:8080/analytics/dashboard';

  constructor(private http: HttpClient) {}

  getDashboard() {
    return this.http.get<DashboardAnalytics>(this.apiUrl);
  }
}

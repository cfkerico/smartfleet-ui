import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Driver } from '../../models/driver.model';
import { PageResponse} from '../../models/page-response.model';
import {DriverAnalysis} from '../../models/driver-analysis.model';
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({ providedIn: 'root' })
export class DriverService {

    private apiUrl = API_ENDPOINTS.drivers;

    constructor(private http: HttpClient) {}

    getAll(page: number, size: number): Observable<PageResponse<Driver>> {
      const params = new HttpParams()
        .set('page', page)
        .set('size', size);
        return this.http.get<PageResponse<Driver>>(this.apiUrl, {params});
    }

    getOptions(): Observable<Driver[]> {
      return this.http.get<Driver[]>(`${this.apiUrl}/options`);
    }

    getById(driverId: number): Observable<Driver> {
      return this.http.get<Driver>(`${this.apiUrl}/${driverId}`);
    }

    create(payload: any): Observable<Driver> {
        return this.http.post<Driver>(this.apiUrl, payload);
    }

    update(driverId: number, payload: any): Observable<void> {
      return this.http.put<void>(`${this.apiUrl}/${driverId}`, payload);
    }

    delete(driverId: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${driverId}`);
    }

    reactivate(driverId: number): Observable<void> {
      return this.http.put<void>(`${this.apiUrl}/${driverId}/reactivate`, {});
    }

    analyse(id: number) {
      return this.http.get<DriverAnalysis>(`${this.apiUrl}/${id}/analyse`);
    }
}

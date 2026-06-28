import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Driver } from '../../models/driver.model';
import { PageResponse} from '../../models/page-response.model';
import {DriverAnalysis} from '../../models/driver-analysis.model';

@Injectable({ providedIn: 'root' })
export class DriverService {

    private apiUrl = 'http://localhost:8080/api/drivers';

    constructor(private http: HttpClient) {}

    getAll(page: number, size: number): Observable<PageResponse<Driver>> {
      const params = new HttpParams()
        .set('page', page)
        .set('size', size);
        return this.http.get<PageResponse<Driver>>(this.apiUrl, {params});
    }

    create(payload: any): Observable<Driver> {
        return this.http.post<Driver>(this.apiUrl, payload);
    }

    update(driverId: number, payload: any): Observable<Driver> {
      return this.http.put<Driver>(`${this.apiUrl}/${driverId}`, payload);
    }

    delete(driverId: number): Observable<any> {
      console.log('************** drivers_id : ', driverId);
      return this.http.delete<Driver>(`${this.apiUrl}/${driverId}`);
    }

    analyse(id: number) {
      console.log('************** analysis drivers_id : '+`${this.apiUrl}/${id}/analyse`, id);
      return this.http.get<DriverAnalysis>(`${this.apiUrl}/${id}/analyse`);
    }
}

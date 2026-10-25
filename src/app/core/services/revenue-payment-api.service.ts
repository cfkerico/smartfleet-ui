import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResult } from '../../models/page-result.model';
import { DriverPayment, DriverPaymentCorrection } from '../../models/payment.model';
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class RevenuePaymentApiService {

  private readonly apiUrl = API_ENDPOINTS.payments;

  constructor(private http: HttpClient) {}

  findPayments(page: number, size: number, filters?: {
    driverId?: number | null; 
    vehicleId?: number | null;
    startDate?: string | null;
    endDate?: string | null;
  }): Observable<PageResult<DriverPayment>> {

    let params = new HttpParams()
      .set('page',page)
      .set('size', size);
console.log('--------- avant Filters :', filters);
      if (filters?.driverId) {
        console.log('--------- Filters driverId:', filters.driverId);
        params = params.set('driverId', filters.driverId);
        console.log('--------- Filters driverId after set:', params);
      }
      if (filters?.vehicleId) {
        params = params.set('vehicleId', filters.vehicleId);
      }
      if (filters?.startDate) {
        params = params.set('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        params = params.set('endDate', filters.endDate);
      }

      console.log('--------- Filters:', filters);

      return this.http.get<PageResult<DriverPayment>>(this.apiUrl, {params});
  }

  getCorrections(paymentId: number): Observable<DriverPaymentCorrection[]> {
    return this.http.get<DriverPaymentCorrection[]>(`${this.apiUrl}/${paymentId}/corrections`);
  }

  correctPayment(paymentId: number, payload: { correctedAmount: number; reason: string }): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${paymentId}/correction`, payload);
  }

  createPayment(payload: { driverId: number; vehicleId: number; paidAmount: number; paymentDate: string }) {
    return this.http.post<void>(this.apiUrl, payload);
  }
}

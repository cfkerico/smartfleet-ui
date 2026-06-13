import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResult } from '../../models/page-result.model';
import { DriverPayment } from '../../models/payment.model';

@Injectable({
  providedIn: 'root',
})
export class RevenuePaymentApiService {

  private readonly apiUrl = 'http://localhost:8080/api/revenues/payments';

  constructor(private http: HttpClient) {}

  findPayments(page: number, size: number): Observable<PageResult<DriverPayment>> {

    const params = new HttpParams()
      .set('page',page)
      .set('size', size);

      return this.http.get<PageResult<DriverPayment>>(this.apiUrl, {params});
  }
}

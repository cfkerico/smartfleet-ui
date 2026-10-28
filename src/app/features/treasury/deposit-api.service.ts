import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/config/api-endpoints';
import { DepositPage, EligibleDepositPaymentPage, ExternalTreasuryAccount,
  PrepareDepositRequest, TreasuryDeposit, TreasuryDepositStatus } from './deposit.model';

@Injectable({ providedIn: 'root' })
export class DepositApiService {
  private readonly http = inject(HttpClient);

  list(status: TreasuryDepositStatus | null, page: number, size: number): Observable<DepositPage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status !== null) params = params.set('status', status);
    return this.http.get<DepositPage>(`${API_ENDPOINTS.treasury}/deposits`, { params });
  }

  findById(id: number): Observable<TreasuryDeposit> {
    return this.http.get<TreasuryDeposit>(`${API_ENDPOINTS.treasury}/deposits/${id}`);
  }

  eligiblePayments(page: number, size: number): Observable<EligibleDepositPaymentPage> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<EligibleDepositPaymentPage>(
      `${API_ENDPOINTS.treasury}/deposits/eligible-payments`, { params });
  }

  externalAccounts(): Observable<ExternalTreasuryAccount[]> {
    return this.http.get<ExternalTreasuryAccount[]>(`${API_ENDPOINTS.treasury}/accounts/external`);
  }

  prepare(request: PrepareDepositRequest): Observable<TreasuryDeposit> {
    return this.http.post<TreasuryDeposit>(`${API_ENDPOINTS.treasury}/deposits`, request);
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/config/api-endpoints';
import { DepositAllocationDetails, DepositPage, EligibleDepositPaymentPage, ExternalTreasuryAccount,
  PrepareDepositRequest, TreasuryDeposit, TreasuryDepositStatus, CashTreasuryAccount,
  TransferCollectionCashRequest, TransferCollectionCashResult, TreasuryMovementPage,
  TreasuryMovementPrefix } from './deposit.model';

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

  allocationDetails(id: number): Observable<DepositAllocationDetails[]> {
    return this.http.get<DepositAllocationDetails[]>(`${API_ENDPOINTS.treasury}/deposits/${id}/allocation-details`);
  }

  eligiblePayments(page: number, size: number): Observable<EligibleDepositPaymentPage> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<EligibleDepositPaymentPage>(
      `${API_ENDPOINTS.treasury}/deposits/eligible-payments`, { params });
  }

  externalAccounts(): Observable<ExternalTreasuryAccount[]> {
    return this.http.get<ExternalTreasuryAccount[]>(`${API_ENDPOINTS.treasury}/accounts/external`);
  }

  disbursementAccounts(): Observable<ExternalTreasuryAccount[]> {
    return this.http.get<ExternalTreasuryAccount[]>(`${API_ENDPOINTS.treasury}/accounts/disbursement`);
  }

  cashAccounts(): Observable<CashTreasuryAccount[]> {
    return this.http.get<CashTreasuryAccount[]>(`${API_ENDPOINTS.treasury}/accounts/cash`);
  }

  transferCollectionCash(request: TransferCollectionCashRequest): Observable<TransferCollectionCashResult> {
    return this.http.post<TransferCollectionCashResult>(
      `${API_ENDPOINTS.treasury}/transfers/collection-to-expenses`, request);
  }

  movements(filters: { accountId: number | null; from: string | null; to: string | null;
    referencePrefix: TreasuryMovementPrefix | null; page: number; size: number }): Observable<TreasuryMovementPage> {
    let params = new HttpParams().set('page', filters.page).set('size', filters.size);
    if (filters.accountId !== null) params = params.set('accountId', filters.accountId);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (filters.referencePrefix) params = params.set('referencePrefix', filters.referencePrefix);
    return this.http.get<TreasuryMovementPage>(`${API_ENDPOINTS.treasury}/movements`, { params });
  }

  prepare(request: PrepareDepositRequest): Observable<TreasuryDeposit> {
    return this.http.post<TreasuryDeposit>(`${API_ENDPOINTS.treasury}/deposits`, request);
  }

  confirm(depositId: number, proofDocumentId: number): Observable<TreasuryDeposit> {
    return this.http.post<TreasuryDeposit>(
      `${API_ENDPOINTS.treasury}/deposits/${depositId}/confirmation`, { proofDocumentId });
  }
}

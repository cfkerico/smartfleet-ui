import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpensePriority, ExpenseStatus, ExpenseRequest, ExpenseType, PaymentMethod } from '../../models/expense.model';
import { PageResult } from '../../models/page-result.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseApiService {

  private readonly apiUrl = 'http://localhost:8080/api/expenses';

  constructor(private http: HttpClient) {}

  findExpenses(
    page: number,
    size: number,
    filters?: {
      vehicleId?: number | null;
      expenseType?: ExpenseType | null;
      status?: ExpenseStatus | null;
      priority?: ExpensePriority | null;
      startDate?: string | null;
      endDate?: string | null;
    }
  ): Observable<PageResult<ExpenseRequest>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters?.vehicleId) {
      params = params.set('vehicleId', filters.vehicleId);
    }

    if (filters?.expenseType) {
      params = params.set('expenseType', filters.expenseType);
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    if (filters?.priority) {
      params = params.set('priority', filters.priority);
    }

    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }

    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<PageResult<ExpenseRequest>>(this.apiUrl, { params });
  }

  createExpense(payload: {
    vehicleId: number;
    expenseType: ExpenseType;
    description?: string | null;
    requestedAmount: number;
    priority?: ExpensePriority | null;
  }): Observable<void> {
    return this.http.post<void>(this.apiUrl, payload);
  }

  approveExpense(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectExpense(id: number, reason: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  disburseExpense(id: number, payload: {
    paidAmount: number;
    paymentMethod: PaymentMethod;
    paymentReference?: string | null;
    beneficiary?: string | null;
    comments?: string | null;
    paymentDate?: string | null;
   }): Observable<void> {
    console.log('----------------------------- ', payload);
    return this.http.patch<void>(`${this.apiUrl}/${id}/disburse`, payload);
  }
}

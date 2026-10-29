import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DepositApiService } from '../deposit-api.service';
import { CashTransferComponent } from './cash-transfer.component';

describe('CashTransferComponent', () => {
  const accounts = [
    { id: 1, type: 'COLLECTION_CASH' as const, name: 'Collecte', currencyCode: 'XOF', balance: 100,
      active: true },
    { id: 2, type: 'EXPENSE_CASH' as const, name: 'Dépenses', currencyCode: 'XOF', balance: 20,
      active: true },
  ];
  it('only permits a funded transfer and updates both displayed balances', () => {
    const transferCollectionCash = vi.fn().mockReturnValue(of({ reference: 'TRANSFER-1',
      collectionAccountId: 1, collectionBalance: 70, expenseCashAccountId: 2,
      expenseCashBalance: 50, transferredAmount: 30, transferredAt: '2026-10-29T00:00:00Z' }));
    TestBed.configureTestingModule({ providers: [
      { provide: DepositApiService, useValue: { cashAccounts: () => of(accounts), transferCollectionCash } },
      { provide: AuthService, useValue: { hasRole: (role: string) => role === 'TREASURER' } },
      { provide: ConfirmationService, useValue: { confirm: () => of(true) } },
      { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } },
    ] });
    const component = TestBed.runInInjectionContext(() => new CashTransferComponent());
    component.ngOnInit();
    component.amount.setValue(150);
    expect(component.canSubmit()).toBe(false);
    component.amount.setValue(30);
    expect(component.canSubmit()).toBe(true);
    component.submit();
    expect(transferCollectionCash).toHaveBeenCalledWith(expect.objectContaining({
      collectionAccountId: 1, expenseCashAccountId: 2, amount: 30,
    }));
    expect(component.collection()?.balance).toBe(70);
    expect(component.expenses()?.balance).toBe(50);
  });
});

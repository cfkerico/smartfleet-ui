import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../../core/auth/auth.service';
import { DepositApiService } from '../deposit-api.service';
import { MovementListComponent } from './movement-list.component';

describe('MovementListComponent', () => {
  it('uses local calendar boundaries for a selected day', () => {
    const movements = vi.fn().mockReturnValue(of({ content: [], page: 0, size: 10,
      totalElements: 0, totalPages: 0, last: true }));
    TestBed.configureTestingModule({ providers: [
      { provide: DepositApiService, useValue: {
        cashAccounts: () => of([]), externalAccounts: () => of([]), movements,
      } },
      { provide: AuthService, useValue: { isAdmin: () => true, hasRole: () => false } },
    ] });
    const component = TestBed.runInInjectionContext(() => new MovementListComponent());
    component.from.setValue('2026-10-28');
    component.to.setValue('2026-10-28');

    component.applyFilters();

    expect(movements).toHaveBeenCalledWith(expect.objectContaining({
      fromInclusive: new Date(2026, 9, 28).toISOString(),
      toExclusive: new Date(2026, 9, 29).toISOString(),
    }));
  });

  it('loads the selected server page and uses account names', () => {
    const movements = vi.fn().mockReturnValue(of({ content: [{ id: 1, companyId: 7, accountId: 2,
      direction: 'DEBIT', amount: 30, balanceBefore: 100, balanceAfter: 70,
      reference: 'TRANSFER-test', recordedBy: 'actor', recordedAt: '2026-10-29T10:00:00Z' }],
      page: 0, size: 10, totalElements: 12, totalPages: 2, last: false }));
    TestBed.configureTestingModule({ providers: [
      { provide: DepositApiService, useValue: {
        cashAccounts: () => of([{ id: 2, type: 'COLLECTION_CASH', name: 'Collecte',
          currencyCode: 'XAF', balance: 70, active: true }]),
        externalAccounts: () => of([]), movements,
      } },
      { provide: AuthService, useValue: { isAdmin: () => false,
        hasRole: (role: string) => role === 'TREASURER' } },
    ] });
    const component = TestBed.runInInjectionContext(() => new MovementListComponent());
    component.ngOnInit();
    expect(component.accountName(2)).toBe('Collecte');
    expect(component.category('TRANSFER-test')).toBe('Transfert');
    component.account.setValue(2);
    component.prefix.setValue('TRANSFER-');
    component.onPageChange({ pageIndex: 1, pageSize: 5, length: 12 });
    expect(movements).toHaveBeenLastCalledWith(expect.objectContaining({
      accountId: 2, referencePrefix: 'TRANSFER-', page: 1, size: 5,
    }));
    expect(component.totalElements()).toBe(12);
  });
});

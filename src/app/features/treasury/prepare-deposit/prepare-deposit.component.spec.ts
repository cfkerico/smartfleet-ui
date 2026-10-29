import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DepositApiService } from '../deposit-api.service';
import { PrepareDepositComponent } from './prepare-deposit.component';

describe('PrepareDepositComponent', () => {
  const payment = { paymentId: 39, driverId: 5, vehicleId: 7,
    driverName: 'Dupont Jean', vehicleLabel: 'CE 135 FG - Toyota Yaris', paymentDate: '2026-07-03',
    paidAmount: 11000, alreadyDeposited: 5000, remainingAmount: 6000 };
  const account = { id: 2, type: 'BANK', name: 'Banque', currencyCode: 'XAF', balance: 100,
    active: true };
  const api = { eligiblePayments: vi.fn(), externalAccounts: vi.fn(), prepare: vi.fn() };
  const auth = { hasRole: vi.fn(() => true) };
  const notification = { success: vi.fn(), error: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    auth.hasRole.mockReturnValue(true);
    api.externalAccounts.mockReturnValue(of([account]));
    api.eligiblePayments.mockReturnValue(of({ content: [payment], page: 0, size: 10,
      totalElements: 1, totalPages: 1, last: true }));
    api.prepare.mockReturnValue(of({ id: 3 }));
    await TestBed.configureTestingModule({
      imports: [PrepareDepositComponent],
      providers: [provideRouter([]),
        { provide: DepositApiService, useValue: api },
        { provide: AuthService, useValue: auth },
        { provide: NotificationService, useValue: notification }],
    }).compileComponents();
  });

  it('loads the active accounts and eligible payments', async () => {
    const fixture = TestBed.createComponent(PrepareDepositComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(api.externalAccounts).toHaveBeenCalledOnce();
    expect(api.eligiblePayments).toHaveBeenCalledWith(0, 10);
    expect(fixture.nativeElement.textContent).toContain('6,000');
    expect(fixture.nativeElement.textContent).toContain('Dupont Jean');
    expect(fixture.nativeElement.textContent).toContain('CE 135 FG - Toyota Yaris');
    expect(fixture.componentInstance.canSubmit()).toBe(false);
  });

  it('prepares selected amounts and navigates to the draft', () => {
    const fixture = TestBed.createComponent(PrepareDepositComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.targetAccountId.setValue(2);
    component.setAmount(payment, { target: { value: '2500' } } as unknown as Event);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    expect(component.canSubmit()).toBe(true);
    component.prepare();

    expect(api.prepare).toHaveBeenCalledWith(expect.objectContaining({
      targetAccountId: 2, allocations: [{ paymentId: 39, amount: 2500 }],
    }));
    expect(notification.success).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/treasury/deposits', 3]);
  });

  it('rejects an amount above the remaining balance', () => {
    const fixture = TestBed.createComponent(PrepareDepositComponent);
    fixture.detectChanges();
    fixture.componentInstance.targetAccountId.setValue(2);
    fixture.componentInstance.setAmount(payment, { target: { value: '6001' } } as unknown as Event);
    expect(fixture.componentInstance.canSubmit()).toBe(false);
    fixture.componentInstance.prepare();
    expect(api.prepare).not.toHaveBeenCalled();
  });

  it('keeps selected allocations while changing server pages', () => {
    const fixture = TestBed.createComponent(PrepareDepositComponent);
    fixture.detectChanges();
    fixture.componentInstance.setAmount(payment, { target: { value: '2500' } } as unknown as Event);
    api.eligiblePayments.mockReturnValue(of({ content: [], page: 1, size: 5,
      totalElements: 6, totalPages: 2, last: true }));

    fixture.componentInstance.onPageChange({ pageIndex: 1, pageSize: 5, length: 6 });

    expect(api.eligiblePayments).toHaveBeenLastCalledWith(1, 5);
    expect(fixture.componentInstance.selectedCount()).toBe(1);
    expect(fixture.componentInstance.selectedTotal()).toBe(2500);
  });

  it('does not load data for a non-treasurer', () => {
    auth.hasRole.mockReturnValue(false);
    const fixture = TestBed.createComponent(PrepareDepositComponent);
    fixture.detectChanges();
    expect(api.externalAccounts).not.toHaveBeenCalled();
    expect(api.eligiblePayments).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Seul un trésorier');
  });
});

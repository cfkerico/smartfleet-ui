import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DepositApiService } from '../deposit-api.service';
import { TreasuryInitializationComponent } from './treasury-initialization.component';

registerLocaleData(localeFr);

describe('TreasuryInitializationComponent', () => {
  const api = { getInitialization: vi.fn(), initializeTreasury: vi.fn() };
  const auth = { isAdmin: vi.fn() };
  const confirmation = { confirm: vi.fn() };
  const notification = { success: vi.fn(), error: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    auth.isAdmin.mockReturnValue(true);
    api.getInitialization.mockReturnValue(of({ initialized: false, cutoverDate: null, currencyCode: null,
      collectionOpeningBalance: null, expenseCashOpeningBalance: null, initializedAt: null }));
    confirmation.confirm.mockReturnValue(of(true));
    await TestBed.configureTestingModule({
      imports: [TreasuryInitializationComponent],
      providers: [
        { provide: DepositApiService, useValue: api },
        { provide: AuthService, useValue: auth },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();
  });

  it('shows empty inputs before initialization and prevents invalid submission', () => {
    const fixture = TestBed.createComponent(TreasuryInitializationComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.form.getRawValue()).toEqual({ cutoverDate: '', currencyCode: '',
      collectionOpeningBalance: '', expenseCashOpeningBalance: '' });
    component.submit(new Event('submit'));
    expect(confirmation.confirm).not.toHaveBeenCalled();
    expect(api.initializeTreasury).not.toHaveBeenCalled();
  });

  it('submits exact decimal values only after confirmation, then displays a read-only summary', () => {
    const fixture = TestBed.createComponent(TreasuryInitializationComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.setValue({ cutoverDate: '2026-07-01', currencyCode: 'xaf',
      collectionOpeningBalance: '500000,50', expenseCashOpeningBalance: '0' });
    api.initializeTreasury.mockReturnValue(of({ companyId: 1, cutoverDate: '2026-07-01', currencyCode: 'XAF',
      collectionAccountId: 1, collectionOpeningBalance: 500000.50,
      expenseCashAccountId: 2, expenseCashOpeningBalance: 0 }));
    api.getInitialization.mockReturnValue(of({ initialized: true, cutoverDate: '2026-07-01', currencyCode: 'XAF',
      collectionOpeningBalance: 500000.50, expenseCashOpeningBalance: 0, initializedAt: '2026-10-31T10:00:00Z' }));

    component.submit(new Event('submit'));
    fixture.detectChanges();

    expect(api.initializeTreasury).toHaveBeenCalledExactlyOnceWith({ cutoverDate: '2026-07-01',
      currencyCode: 'XAF', collectionOpeningBalance: '500000.50', expenseCashOpeningBalance: '0' });
    expect(component.status()?.initialized).toBe(true);
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(notification.success).toHaveBeenCalled();
  });

  it('does not submit when confirmation is cancelled', () => {
    confirmation.confirm.mockReturnValue(of(false));
    const fixture = TestBed.createComponent(TreasuryInitializationComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({ cutoverDate: '2026-07-01', currencyCode: 'XAF',
      collectionOpeningBalance: '0', expenseCashOpeningBalance: '0' });
    fixture.componentInstance.submit(new Event('submit'));
    expect(api.initializeTreasury).not.toHaveBeenCalled();
  });

  it('keeps the form locked if the initial state cannot be verified', () => {
    api.getInitialization.mockReturnValue(throwError(() => new Error('network')));
    const fixture = TestBed.createComponent(TreasuryInitializationComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.loadError()).toBe(true);
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('does not call the API for a non-admin', () => {
    auth.isAdmin.mockReturnValue(false);
    const fixture = TestBed.createComponent(TreasuryInitializationComponent);
    fixture.detectChanges();
    expect(api.getInitialization).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Seul un administrateur');
  });
});

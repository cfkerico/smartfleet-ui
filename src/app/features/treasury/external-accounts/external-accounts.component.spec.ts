import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DepositApiService } from '../deposit-api.service';
import { ExternalTreasuryAccount } from '../deposit.model';
import { ExternalAccountsComponent } from './external-accounts.component';

describe('ExternalAccountsComponent', () => {
  const api = { externalAccounts: vi.fn(), createExternalAccount: vi.fn(),
    deactivateExternalAccount: vi.fn(), reactivateExternalAccount: vi.fn() };
  const auth = { isAdmin: vi.fn(), hasRole: vi.fn() };
  const confirmation = { confirm: vi.fn() };
  const notification = { success: vi.fn(), error: vi.fn() };
  const account: ExternalTreasuryAccount = { id: 3, type: 'BANK', name: 'SCB', currencyCode: 'XAF', balance: 0, active: true };

  beforeEach(async () => {
    vi.clearAllMocks();
    auth.isAdmin.mockReturnValue(true);
    auth.hasRole.mockReturnValue(false);
    api.externalAccounts.mockReturnValue(of([account]));
    api.createExternalAccount.mockReturnValue(of({ ...account, id: 4, name: 'Orange Money', type: 'MOBILE_MONEY' }));
    api.deactivateExternalAccount.mockReturnValue(of({ ...account, active: false }));
    api.reactivateExternalAccount.mockReturnValue(of(account));
    confirmation.confirm.mockReturnValue(of(true));
    await TestBed.configureTestingModule({
      imports: [ExternalAccountsComponent],
      providers: [
        { provide: DepositApiService, useValue: api },
        { provide: AuthService, useValue: auth },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();
  });

  it('shows existing accounts and creates a trimmed external account for ADMIN', async () => {
    const fixture = TestBed.createComponent(ExternalAccountsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('SCB');
    const component = fixture.componentInstance;
    component.type.setValue('MOBILE_MONEY');
    component.name.setValue('  Orange Money  ');
    const submit = new Event('submit', { bubbles: true, cancelable: true });
    fixture.nativeElement.querySelector('form').dispatchEvent(submit);
    expect(submit.defaultPrevented).toBe(true);
    expect(api.createExternalAccount).toHaveBeenCalledExactlyOnceWith({ type: 'MOBILE_MONEY', name: 'Orange Money' });
    expect(component.accounts()).toHaveLength(2);
    expect(notification.success).toHaveBeenCalledOnce();
  });

  it('allows TREASURER to read but not create accounts', () => {
    auth.isAdmin.mockReturnValue(false);
    auth.hasRole.mockImplementation((role: string) => role === 'TREASURER');
    const fixture = TestBed.createComponent(ExternalAccountsComponent);
    fixture.detectChanges();
    expect(api.externalAccounts).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).not.toContain('Nouveau compte externe');
    fixture.componentInstance.type.setValue('BANK');
    fixture.componentInstance.name.setValue('Banque');
    fixture.componentInstance.create(new Event('submit', { cancelable: true }));
    expect(api.createExternalAccount).not.toHaveBeenCalled();
  });

  it('does not load accounts for an unauthorized user', () => {
    auth.isAdmin.mockReturnValue(false);
    auth.hasRole.mockReturnValue(false);
    const fixture = TestBed.createComponent(ExternalAccountsComponent);
    fixture.detectChanges();
    expect(api.externalAccounts).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Accès réservé');
  });

  it('confirms deactivation of a zero-balance account and keeps it visible as inactive', () => {
    const fixture = TestBed.createComponent(ExternalAccountsComponent);
    fixture.detectChanges();
    fixture.componentInstance.deactivate(account);
    expect(confirmation.confirm).toHaveBeenCalledOnce();
    expect(api.deactivateExternalAccount).toHaveBeenCalledExactlyOnceWith(3);
    expect(fixture.componentInstance.accounts()[0].active).toBe(false);
    expect(notification.success).toHaveBeenCalledOnce();
  });

  it('refuses deactivation when the balance is nonzero', () => {
    const fixture = TestBed.createComponent(ExternalAccountsComponent);
    fixture.detectChanges();
    fixture.componentInstance.deactivate({ ...account, balance: 100 });
    expect(confirmation.confirm).not.toHaveBeenCalled();
    expect(api.deactivateExternalAccount).not.toHaveBeenCalled();
  });

  it('confirms reactivation of an inactive account and keeps its identity and balance', () => {
    const inactive = { ...account, active: false };
    api.externalAccounts.mockReturnValue(of([inactive]));
    const fixture = TestBed.createComponent(ExternalAccountsComponent);
    fixture.detectChanges();
    fixture.componentInstance.reactivate(inactive);
    expect(confirmation.confirm).toHaveBeenCalledOnce();
    expect(api.reactivateExternalAccount).toHaveBeenCalledExactlyOnceWith(3);
    expect(fixture.componentInstance.accounts()[0]).toEqual(account);
    expect(notification.success).toHaveBeenCalledOnce();
  });

  it('does not allow a treasurer to reactivate an account', () => {
    auth.isAdmin.mockReturnValue(false);
    auth.hasRole.mockImplementation((role: string) => role === 'TREASURER');
    const fixture = TestBed.createComponent(ExternalAccountsComponent);
    fixture.detectChanges();
    fixture.componentInstance.reactivate({ ...account, active: false });
    expect(confirmation.confirm).not.toHaveBeenCalled();
    expect(api.reactivateExternalAccount).not.toHaveBeenCalled();
  });
});

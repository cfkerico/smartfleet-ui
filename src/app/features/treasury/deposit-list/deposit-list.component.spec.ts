import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { DepositApiService } from '../deposit-api.service';
import { DepositListComponent } from './deposit-list.component';

describe('DepositListComponent', () => {
  const api = { list: vi.fn() };
  const auth = { isAdmin: vi.fn(() => false), hasRole: vi.fn((role: string) => role === 'TREASURER') };
  const deposit = {
    id: 3, companyId: 1, targetAccountId: 2, amount: 40000,
    operationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', status: 'CONFIRMED',
    allocations: [{ paymentId: 11, amount: 40000 }], proofDocumentId: 9,
    createdBy: 'treasurer', createdAt: '2026-10-28T10:00:00Z',
    confirmedBy: 'treasurer', confirmedAt: '2026-10-28T11:00:00Z',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    auth.hasRole.mockImplementation((role: string) => role === 'TREASURER');
    api.list.mockReturnValue(of({ content: [deposit], page: 0, size: 10,
      totalElements: 1, totalPages: 1, last: true }));
    await TestBed.configureTestingModule({
      imports: [DepositListComponent],
      providers: [provideRouter([]),
        { provide: DepositApiService, useValue: api },
        { provide: AuthService, useValue: auth }],
    }).compileComponents();
  });

  it('loads the company deposits and opens the detail link', async () => {
    const fixture = TestBed.createComponent(DepositListComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(api.list).toHaveBeenCalledWith(null, 0, 10);
    expect(fixture.nativeElement.textContent).toContain('Confirmé');
    expect(fixture.nativeElement.querySelector('a[href="/treasury/deposits/3"]')).toBeTruthy();
  });

  it('resets the page when the status changes', () => {
    const fixture = TestBed.createComponent(DepositListComponent);
    fixture.detectChanges();
    fixture.componentInstance.onPageChange({ pageIndex: 2, pageSize: 5, length: 30 });
    expect(api.list).toHaveBeenLastCalledWith(null, 2, 5);
    fixture.componentInstance.status.setValue('CONFIRMED');
    expect(api.list).toHaveBeenLastCalledWith('CONFIRMED', 0, 5);
  });

  it('does not call the API for an unauthorized user', () => {
    auth.hasRole.mockReturnValue(false);
    const fixture = TestBed.createComponent(DepositListComponent);
    fixture.detectChanges();
    expect(api.list).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('réservée aux administrateurs');
  });
});

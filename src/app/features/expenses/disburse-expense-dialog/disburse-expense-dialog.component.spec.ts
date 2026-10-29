import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DisburseExpenseDialogComponent } from './disburse-expense-dialog.component';
import { DepositApiService } from '../../treasury/deposit-api.service';
import { of } from 'rxjs';

describe('DisburseExpenseDialogComponent', () => {
  let component: DisburseExpenseDialogComponent;
  let fixture: ComponentFixture<DisburseExpenseDialogComponent>;
  const close = vi.fn();
  const treasuryApi = { disbursementAccounts: vi.fn(() => of([
    { id: 2, type: 'EXPENSE_CASH', name: 'Caisse de dépenses', currencyCode: 'XAF', balance: 1000, active: true },
    { id: 3, type: 'BANK', name: 'Banque principale', currencyCode: 'XAF', balance: 2000, active: true },
  ])) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisburseExpenseDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { expense: { vehicleLabel: 'Véhicule test', requestedAmount: 1000 } },
        },
        { provide: MatDialogRef, useValue: { close } },
        { provide: DepositApiService, useValue: treasuryApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DisburseExpenseDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not close with a zero disbursement', () => {
    close.mockClear();
    component.form.patchValue({ paidAmount: 0, paymentMethod: 'CASH' });

    component.submit();

    expect(component.form.controls.paidAmount.hasError('min')).toBe(true);
    expect(close).not.toHaveBeenCalled();
  });

  it('should return the payment details when valid', () => {
    close.mockClear();
    component.form.patchValue({
      paidAmount: 500,
      paymentMethod: 'BANK_TRANSFER',
      sourceAccountId: 3,
      referenceNumber: 'VIR-001',
      paymentDate: new Date(2026, 9, 24),
    });

    component.submit();

    expect(close).toHaveBeenCalledWith(expect.objectContaining({
      paidAmount: 500,
      paymentMethod: 'BANK_TRANSFER',
      sourceAccountId: 3,
      referenceNumber: 'VIR-001',
      paymentDate: '2026-10-24T12:00:00.000Z',
    }));
  });

  it('resets the account when the payment method changes', () => {
    component.form.patchValue({ paymentMethod: 'BANK_TRANSFER', sourceAccountId: 3 });
    expect(component.availableAccounts().map(account => account.id)).toEqual([3]);

    component.form.controls.paymentMethod.setValue('CASH');

    expect(component.form.controls.sourceAccountId.value).toBeNull();
    expect(component.availableAccounts().map(account => account.id)).toEqual([2]);
  });
});

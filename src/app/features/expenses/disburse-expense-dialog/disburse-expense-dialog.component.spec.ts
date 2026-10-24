import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DisburseExpenseDialogComponent } from './disburse-expense-dialog.component';

describe('DisburseExpenseDialogComponent', () => {
  let component: DisburseExpenseDialogComponent;
  let fixture: ComponentFixture<DisburseExpenseDialogComponent>;
  const close = vi.fn();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisburseExpenseDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { expense: { vehicleLabel: 'Véhicule test', requestedAmount: 1000 } },
        },
        { provide: MatDialogRef, useValue: { close } },
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
      referenceNumber: 'VIR-001',
      paymentDate: new Date(Date.UTC(2026, 9, 24)),
    });

    component.submit();

    expect(close).toHaveBeenCalledWith(expect.objectContaining({
      paidAmount: 500,
      paymentMethod: 'BANK_TRANSFER',
      referenceNumber: 'VIR-001',
      paymentDate: '2026-10-24T00:00:00.000Z',
    }));
  });
});

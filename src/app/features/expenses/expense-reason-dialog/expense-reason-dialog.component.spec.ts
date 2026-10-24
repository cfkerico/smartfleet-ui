import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ExpenseReasonDialogComponent } from './expense-reason-dialog.component';

describe('RejectExpenseDialogComponent', () => {
  let component: ExpenseReasonDialogComponent;
  let fixture: ComponentFixture<ExpenseReasonDialogComponent>;
  const close = vi.fn();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseReasonDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Motif',
            message: 'Saisissez un motif',
            confirmLabel: 'Confirmer',
            confirmColor: 'warn',
            placeholderMotif: 'Motif',
          },
        },
        { provide: MatDialogRef, useValue: { close } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseReasonDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require a reason of at least five characters', () => {
    close.mockClear();
    component.form.patchValue({ reason: 'abc' });

    component.submit();

    expect(component.form.controls.reason.hasError('minlength')).toBe(true);
    expect(close).not.toHaveBeenCalled();
  });

  it('should return the reason when valid', () => {
    close.mockClear();
    component.form.patchValue({ reason: 'Demande en double' });

    component.submit();

    expect(close).toHaveBeenCalledWith({ reason: 'Demande en double' });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ExpenseReasonDialogComponent } from './expense-reason-dialog.component';

describe('RejectExpenseDialogComponent', () => {
  let component: ExpenseReasonDialogComponent;
  let fixture: ComponentFixture<ExpenseReasonDialogComponent>;

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
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseReasonDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

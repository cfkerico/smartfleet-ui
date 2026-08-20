import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DisburseExpenseDialogComponent } from './disburse-expense-dialog.component';

describe('DisburseExpenseDialogComponent', () => {
  let component: DisburseExpenseDialogComponent;
  let fixture: ComponentFixture<DisburseExpenseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisburseExpenseDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { expense: { vehicleLabel: 'Véhicule test', requestedAmount: 1000 } },
        },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DisburseExpenseDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

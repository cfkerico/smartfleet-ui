import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { ExpenseApiService } from '../../../core/services/expense-api.service';

import { CreateExpenseDialogComponent } from './create-expense-dialog.component';

describe('CreateExpenseDialogComponent', () => {
  let component: CreateExpenseDialogComponent;
  let fixture: ComponentFixture<CreateExpenseDialogComponent>;
  const createExpense = vi.fn(() => of(undefined));
  const close = vi.fn();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateExpenseDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close } },
        { provide: AssignmentApiService, useValue: { findVehicles: () => of([]) } },
        { provide: ExpenseApiService, useValue: { createExpense } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateExpenseDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reject a zero amount without sending a request', () => {
    createExpense.mockClear();
    component.form.patchValue({ vehicleId: 1, expenseType: 'FUEL', requestedAmount: 0 });

    component.submit();

    expect(component.form.get('requestedAmount')?.hasError('min')).toBe(true);
    expect(createExpense).not.toHaveBeenCalled();
  });

  it('should create an expense and close on success', () => {
    createExpense.mockClear();
    close.mockClear();
    component.form.patchValue({ vehicleId: 1, expenseType: 'FUEL', requestedAmount: 10000 });

    component.submit();

    expect(createExpense).toHaveBeenCalledWith(expect.objectContaining({
      vehicleId: 1, expenseType: 'FUEL', requestedAmount: 10000, priority: 'NORMAL',
    }));
    expect(close).toHaveBeenCalledWith(true);
  });
});

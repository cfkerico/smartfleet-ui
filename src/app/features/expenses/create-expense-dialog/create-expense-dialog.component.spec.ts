import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { ExpenseApiService } from '../../../core/services/expense-api.service';

import { CreateExpenseDialogComponent } from './create-expense-dialog.component';

describe('CreateExpenseDialogComponent', () => {
  let component: CreateExpenseDialogComponent;
  let fixture: ComponentFixture<CreateExpenseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateExpenseDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: AssignmentApiService, useValue: { findVehicles: () => of([]) } },
        { provide: ExpenseApiService, useValue: { createExpense: () => of(null) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateExpenseDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

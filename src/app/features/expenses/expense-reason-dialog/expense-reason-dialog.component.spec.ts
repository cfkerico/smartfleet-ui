import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseReasonDialogComponent } from './expense-reason-dialog.component';

describe('RejectExpenseDialogComponent', () => {
  let component: ExpenseReasonDialogComponent;
  let fixture: ComponentFixture<ExpenseReasonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseReasonDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseReasonDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

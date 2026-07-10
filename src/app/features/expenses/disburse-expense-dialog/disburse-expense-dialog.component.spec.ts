import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisburseExpenseDialogComponent } from './disburse-expense-dialog.component';

describe('DisburseExpenseDialogComponent', () => {
  let component: DisburseExpenseDialogComponent;
  let fixture: ComponentFixture<DisburseExpenseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisburseExpenseDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DisburseExpenseDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

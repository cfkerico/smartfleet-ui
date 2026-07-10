import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectExpenseDialogComponent } from './reject-expense-dialog.component';

describe('RejectExpenseDialogComponent', () => {
  let component: RejectExpenseDialogComponent;
  let fixture: ComponentFixture<RejectExpenseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectExpenseDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RejectExpenseDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

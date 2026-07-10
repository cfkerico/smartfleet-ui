import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateExpenseDialogComponent } from './create-expense-dialog.component';

describe('CreateExpenseDialogComponent', () => {
  let component: CreateExpenseDialogComponent;
  let fixture: ComponentFixture<CreateExpenseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateExpenseDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateExpenseDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

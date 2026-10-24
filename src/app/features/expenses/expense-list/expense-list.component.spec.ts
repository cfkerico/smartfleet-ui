import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { ExpenseApiService } from '../../../core/services/expense-api.service';

import { ExpenseListComponent } from './expense-list.component';
import { ExpenseRequest, ExpenseStatus } from '../../../models/expense.model';

describe('ExpenseListComponent', () => {
  let component: ExpenseListComponent;
  let fixture: ComponentFixture<ExpenseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseListComponent],
      providers: [
        provideRouter([]),
        { provide: AssignmentApiService, useValue: { findVehicles: () => of([]) } },
        {
          provide: ExpenseApiService,
          useValue: {
            findExpenses: () => of({ content: [], totalElements: 0, page: 0, size: 10 }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.each([
    ['REQUESTED', 'Demandée', 'requested'],
    ['APPROVED', 'Approuvée', 'approved'],
    ['PARTIALLY_DISBURSED', 'Partiellement décaissée', 'partially-disbursed'],
    ['DISBURSED', 'Décaissée', 'disbursed'],
    ['REJECTED', 'Rejetée', 'rejected'],
    ['CANCELLED', 'Annulée', 'cancelled'],
  ])('should identify a %s expense in the list', (status, label, rowClass) => {
    component.dataSource.data = [{
      id: 1,
      vehicleLabel: 'Toyota Yaris',
      expenseType: 'FUEL',
      requestedAmount: 10000,
      priority: 'NORMAL',
      status: status as ExpenseStatus,
      createdAt: new Date(2026, 9, 24),
    } as ExpenseRequest];
    fixture.detectChanges();

    const row: HTMLElement | null = fixture.nativeElement.querySelector(`.expense-row--${rowClass}`);
    expect(row).toBeTruthy();
    expect(row?.querySelector('.status-badge')?.textContent?.trim()).toBe(label);
  });
});

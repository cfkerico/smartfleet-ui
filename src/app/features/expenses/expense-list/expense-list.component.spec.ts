import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { VehicleService } from '../../../core/services/vehicle.service';
import { ExpenseApiService } from '../../../core/services/expense-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Vehicle } from '../../../models/vehicle';

import { ExpenseListComponent } from './expense-list.component';
import { ExpenseRequest, ExpenseStatus } from '../../../models/expense.model';

describe('ExpenseListComponent', () => {
  let component: ExpenseListComponent;
  let fixture: ComponentFixture<ExpenseListComponent>;
  let roles = ['ADMIN'];
  const authMock = { hasRole: (role: string) => roles.includes(role) };
  const vehicleOptions = [
    { id: 1, label: 'Toyota Yaris', vehicleStatus: 'ASSIGNED' },
    { id: 2, label: 'Renault Clio', vehicleStatus: 'INACTIVE' },
  ] as Vehicle[];

  beforeEach(async () => {
    roles = ['ADMIN'];
    await TestBed.configureTestingModule({
      imports: [ExpenseListComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
        { provide: VehicleService, useValue: { getOptions: () => of(vehicleOptions) } },
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

  it('limits approval and disbursement actions to their roles', () => {
    expect(component.canApprove()).toBe(true);
    expect(component.canDisburse()).toBe(false);
    roles = ['TREASURER'];
    expect(component.canApprove()).toBe(false);
    expect(component.canDisburse()).toBe(true);
    roles = [];
    expect(component.canApprove()).toBe(false);
    expect(component.canDisburse()).toBe(false);
  });

  it('includes assigned and inactive vehicles in the historical filter', () => {
    expect(component.vehicles.map(vehicle => vehicle.id)).toEqual([1, 2]);
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { VehicleService } from '../../../core/services/vehicle.service';
import { ExpenseApiService } from '../../../core/services/expense-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Vehicle } from '../../../models/vehicle';

import { ExpenseListComponent } from './expense-list.component';
import { ExpenseRequest, ExpenseStatus } from '../../../models/expense.model';

describe('ExpenseListComponent', () => {
  let component: ExpenseListComponent;
  let fixture: ComponentFixture<ExpenseListComponent>;
  let roles = ['ADMIN'];
  const authMock = { hasRole: (role: string) => roles.includes(role) };
  const notify = { success: vi.fn(), error: vi.fn() };
  const expenseApiMock = {
    findExpenses: vi.fn(() => of({ content: [], totalElements: 0, page: 0, size: 10 })),
    disburseExpense: vi.fn(() => of(undefined)),
  };
  const dialogMock = { open: vi.fn() };
  const vehicleOptions = [
    { id: 1, label: 'Toyota Yaris', vehicleStatus: 'ASSIGNED' },
    { id: 2, label: 'Renault Clio', vehicleStatus: 'INACTIVE' },
  ] as Vehicle[];

  beforeEach(async () => {
    vi.clearAllMocks();
    roles = ['ADMIN'];
    expenseApiMock.findExpenses.mockReturnValue(of({ content: [], totalElements: 0, page: 0, size: 10 }));
    expenseApiMock.disburseExpense.mockReturnValue(of(undefined));
    await TestBed.configureTestingModule({
      imports: [ExpenseListComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
        { provide: NotificationService, useValue: notify },
        { provide: MatDialog, useValue: dialogMock },
        { provide: VehicleService, useValue: { getOptions: () => of(vehicleOptions) } },
        { provide: ExpenseApiService, useValue: expenseApiMock },
      ],
    }).overrideComponent(ExpenseListComponent, {
      add: { providers: [{ provide: MatDialog, useValue: dialogMock }] },
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

  it('shows labels on expense action buttons', () => {
    component.dataSource.data = [{
      id: 1, vehicleLabel: 'Toyota Yaris', expenseType: 'FUEL', requestedAmount: 10000,
      priority: 'NORMAL', status: 'REQUESTED', createdAt: new Date(2026, 9, 24),
    } as ExpenseRequest];
    fixture.detectChanges();
    const labels = fixture.debugElement.queryAll(By.directive(MatTooltip))
      .map(element => element.injector.get(MatTooltip).message);
    expect(labels).toEqual(expect.arrayContaining([
      'Dossier documentaire', 'Voir le détail', 'Approuver', 'Rejeter', 'Annuler la dépense',
    ]));
  });

  it('notifies when a disbursement succeeds', () => {
    roles = ['TREASURER'];
    const expense = { id: 1, status: 'APPROVED' } as ExpenseRequest;
    const payment = { paidAmount: 1000, paymentMethod: 'CASH' };
    dialogMock.open.mockReturnValue({ afterClosed: () => of(payment) });
    component.disburse(expense);
    expect(expenseApiMock.disburseExpense).toHaveBeenCalledWith(1, payment);
    expect(notify.success).toHaveBeenCalledWith('Décaissement enregistré avec succès.');
    expect(expenseApiMock.findExpenses).toHaveBeenCalledTimes(2);
  });

  it('explains a disbursement exceeding the remaining amount', () => {
    roles = ['TREASURER'];
    const expense = { id: 1, status: 'APPROVED' } as ExpenseRequest;
    dialogMock.open.mockReturnValue({ afterClosed: () => of({ paidAmount: 2000 }) });
    expenseApiMock.disburseExpense.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 409, error: { message: 'Total disbursed amount cannot exceed requested amount.' },
    })));
    component.disburse(expense);
    expect(notify.error).toHaveBeenCalledWith('Le montant saisi dépasse le solde restant à décaisser.');
    expect(notify.success).not.toHaveBeenCalled();
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

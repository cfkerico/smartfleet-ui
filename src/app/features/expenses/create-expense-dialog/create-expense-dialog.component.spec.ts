import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { VehicleService } from '../../../core/services/vehicle.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Vehicle } from '../../../models/vehicle';
import { ExpenseApiService } from '../../../core/services/expense-api.service';

import { CreateExpenseDialogComponent } from './create-expense-dialog.component';

describe('CreateExpenseDialogComponent', () => {
  let component: CreateExpenseDialogComponent;
  let fixture: ComponentFixture<CreateExpenseDialogComponent>;
  const createExpense = vi.fn(() => of(undefined));
  const getOptions = vi.fn(() => of([] as Vehicle[]));
  const notifySuccess = vi.fn();
  const close = vi.fn();

  beforeEach(async () => {
    getOptions.mockClear();
    notifySuccess.mockClear();
    await TestBed.configureTestingModule({
      imports: [CreateExpenseDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close } },
        { provide: VehicleService, useValue: { getOptions } },
        { provide: NotificationService, useValue: { success: notifySuccess } },
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

  it('allows assigned vehicles but excludes inactive vehicles from new requests', () => {
    getOptions.mockReturnValue(of([
      { id: 3, vehicleStatus: 'ASSIGNED' },
      { id: 4, vehicleStatus: 'INACTIVE' },
    ] as Vehicle[]));
    component.ngOnInit();
    expect(component.vehicles.map(vehicle => vehicle.id)).toEqual([3]);
  });

  it('should reject a zero amount without sending a request', () => {
    createExpense.mockClear();
    component.form.patchValue({ vehicleId: 1, expenseType: 'FUEL', requestedAmount: 0 });

    component.submit();

    expect(component.form.get('requestedAmount')?.hasError('min')).toBe(true);
    expect(createExpense).not.toHaveBeenCalled();
  });

  it('locks the vehicle from its detail page and rejects another vehicle', () => {
    createExpense.mockClear();
    getOptions.mockClear();
    component.data = {
      preselectedVehicle: {
        id: 9, brand: 'Toyota', model: 'Yaris', label: 'Toyota Yaris',
        year: 2004, vehicleStatus: 'AVAILABLE', fuelType: 'ESSENCE',
        vin: 'VIN-9', registrationNumber: 'CE 135 FG',
      },
    };
    component.ngOnInit();

    expect(getOptions).not.toHaveBeenCalled();
    expect(component.vehicles.map(vehicle => vehicle.id)).toEqual([9]);
    expect(component.form.get('vehicleId')?.disabled).toBe(true);
    expect(component.form.getRawValue().vehicleId).toBe(9);

    component.form.patchValue({ vehicleId: 10, expenseType: 'FUEL', requestedAmount: 10000 });
    component.submit();
    expect(createExpense).not.toHaveBeenCalled();

    component.form.patchValue({ vehicleId: 9 });
    component.submit();
    expect(createExpense).toHaveBeenCalledWith(expect.objectContaining({ vehicleId: 9 }));
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
    expect(notifySuccess).toHaveBeenCalledWith('Dépense créée avec succès');
  });
});

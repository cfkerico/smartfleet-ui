import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Driver } from '../../../models/driver.model';
import { Vehicle } from '../../../models/vehicle';

import { AssignmentFormComponent } from './assignment-form.component';

describe('AssignmentFormComponent', () => {
  let component: AssignmentFormComponent;
  let fixture: ComponentFixture<AssignmentFormComponent>;
  const createAssignment = vi.fn(() => of(1));
  const close = vi.fn();
  const driver = { id: 2, nom: 'Dupont', prenom: 'Alice', status: 'ACTIVE' } as Driver;
  const vehicle = { id: 3, brand: 'Toyota', model: 'Yaris', vehicleStatus: 'AVAILABLE' } as Vehicle;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentFormComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'CREATE' } },
        { provide: MatDialogRef, useValue: { close } },
        {
          provide: AssignmentApiService,
          useValue: {
            findDrivers: () => of([driver]),
            findVehicles: () => of([vehicle]),
            findAssignments: () => of([]),
            createAssignment,
          },
        },
        { provide: NotificationService, useValue: { success: () => undefined, error: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('locks the preselected driver and includes it in the creation payload', () => {
    createAssignment.mockClear();
    component.data.preselectedDriver = driver;
    component.ngOnInit();
    component.form.patchValue({ vehicleId: 3, startDate: new Date(2026, 9, 24) });

    expect(component.form.get('driverId')?.disabled).toBe(true);
    expect(component.canCreateAssignment()).toBe(true);
    component.onSubmit();

    expect(createAssignment).toHaveBeenCalledWith(expect.objectContaining({
      driverId: 2, vehicleId: 3,
    }));
  });

  it('refuses a contextual owner that is no longer assignable', () => {
    createAssignment.mockClear();
    component.data.preselectedDriver = { ...driver, id: 5 };
    component.ngOnInit();
    component.form.patchValue({ vehicleId: 3 });

    expect(component.contextUnavailable()).toBe(true);
    expect(component.canCreateAssignment()).toBe(false);
    component.onSubmit();
    expect(createAssignment).not.toHaveBeenCalled();
  });

  it('shows a distinct empty-state message for each missing resource', () => {
    expect(component.availabilityMessage()).toBeNull();

    component.drivers = [];
    expect(component.availabilityMessage()).toContain('Aucun chauffeur disponible');
    component.vehicles = [];
    expect(component.availabilityMessage()).toContain('Aucun chauffeur ni véhicule disponible');
    component.drivers = [driver];
    expect(component.availabilityMessage()).toContain('Aucun véhicule disponible');
  });

  it('does not offer a driver already assigned', () => {
    component.assignments = [{ driverId: driver.id, status: 'ACTIVE' } as any];
    expect(component.availableDrivers).toEqual([]);
    expect(component.availabilityMessage()).toContain('Aucun chauffeur disponible');
    expect(component.canCreateAssignment()).toBe(false);
  });

  it('should submit only the resources, type and ISO start date', () => {
    createAssignment.mockClear();
    close.mockClear();
    component.form.patchValue({ driverId: 2, vehicleId: 3, type: 'PRIMARY', startDate: new Date(2026, 9, 24) });

    component.onSubmit();

    expect(createAssignment).toHaveBeenCalledWith(expect.objectContaining({
      driverId: 2,
      vehicleId: 3,
      type: 'PRIMARY',
      startDate: '2026-10-24',
    }));
    expect(close).toHaveBeenCalledWith(true);
  });
});

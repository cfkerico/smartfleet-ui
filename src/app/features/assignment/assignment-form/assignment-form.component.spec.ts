import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { NotificationService } from '../../../core/services/notification.service';

import { AssignmentFormComponent } from './assignment-form.component';

describe('AssignmentFormComponent', () => {
  let component: AssignmentFormComponent;
  let fixture: ComponentFixture<AssignmentFormComponent>;
  const createAssignment = vi.fn(() => of(1));
  const close = vi.fn();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentFormComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'CREATE' } },
        { provide: MatDialogRef, useValue: { close } },
        {
          provide: AssignmentApiService,
          useValue: {
            findDrivers: () => of([]),
            findVehicles: () => of([]),
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

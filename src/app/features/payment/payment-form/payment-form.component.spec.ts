import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RevenuePaymentApiService } from '../../../core/services/revenue-payment-api.service';

import { PaymentFormComponent } from './payment-form.component';
import { VehicleAssignment } from '../../../models/assignment.model';

describe('PaymentFormComponent', () => {
  let component: PaymentFormComponent;
  let fixture: ComponentFixture<PaymentFormComponent>;
  const createPayment = vi.fn(() => of(undefined));
  const close = vi.fn();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentFormComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: MatDialogRef, useValue: { close } },
        { provide: AssignmentApiService, useValue: { findActiveAssignments: () => of([]) } },
        { provide: RevenuePaymentApiService, useValue: { createPayment } },
        { provide: NotificationService, useValue: { success: () => undefined, error: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit an invalid form', () => {
    createPayment.mockClear();
    component.onSubmit();
    expect(createPayment).not.toHaveBeenCalled();
  });

  it('should send a valid payment with an ISO date and close', () => {
    createPayment.mockClear();
    close.mockClear();
    component.assignments = [{ id: 3, driverId: 4, vehicleId: 5 } as VehicleAssignment];
    component.form.patchValue({ assignmentId: 3, paidAmount: 12000, paymentDate: new Date(2026, 9, 24) });

    component.onSubmit();

    expect(createPayment).toHaveBeenCalledWith({
      driverId: 4, vehicleId: 5, paidAmount: 12000, paymentDate: '2026-10-24',
    });
    expect(close).toHaveBeenCalledWith(true);
  });
});

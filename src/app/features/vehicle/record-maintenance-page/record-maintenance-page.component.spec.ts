import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { NotificationService } from '../../../core/services/notification.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { RecordMaintenancePageComponent } from './record-maintenance-page.component';

describe('RecordMaintenancePageComponent', () => {
  const vehicleService = { getById: vi.fn() };
  const maintenanceService = { recordCompleted: vi.fn() };
  const notification = { success: vi.fn(), error: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    vehicleService.getById.mockReturnValue(of({
      id: 1, brand: 'Toyota', model: 'Yaris', registrationNumber: '033830',
      year: 2004, fuelType: 'ESSENCE', currentMileage: 101000,
    }));
    maintenanceService.recordCompleted.mockReturnValue(of({ id: 3 }));

    await TestBed.configureTestingModule({
      imports: [RecordMaintenancePageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ vehicleId: '1' }) } } },
        { provide: VehicleService, useValue: vehicleService },
        { provide: MaintenanceService, useValue: maintenanceService },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();
  });

  it('should create with the vehicle fixed by the route', () => {
    const fixture = TestBed.createComponent(RecordMaintenancePageComponent);
    fixture.detectChanges();

    expect(vehicleService.getById).toHaveBeenCalledWith(1);
    expect(fixture.componentInstance.vehicleId()).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Toyota Yaris');
    expect(fixture.nativeElement.querySelector('[formControlName="vehicleId"]')).toBeNull();
  });

  it('should accept historical mileage and omitted cost, then return to history', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(RecordMaintenancePageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.setValue({
      type: 'OIL_CHANGE', completedDate: component.maxDate,
      mileageAtMaintenance: 100600, costAmount: null,
    });

    component.submit();

    expect(maintenanceService.recordCompleted).toHaveBeenCalledWith({
      vehicleId: 1, type: 'OIL_CHANGE', completedDate: component.maxDate,
      mileageAtMaintenance: 100600, costAmount: null,
    });
    expect(notification.success).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/vehicles', 1, 'maintenances']);
  });

  it('should reject a future date before calling the API', () => {
    const fixture = TestBed.createComponent(RecordMaintenancePageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.setValue({
      type: 'OIL_CHANGE', completedDate: '2099-01-01',
      mileageAtMaintenance: 101000, costAmount: 10000,
    });

    component.submit();

    expect(component.form.controls.completedDate.hasError('futureDate')).toBe(true);
    expect(maintenanceService.recordCompleted).not.toHaveBeenCalled();
  });

  it('should preserve entered values and show the server error', () => {
    maintenanceService.recordCompleted.mockReturnValue(throwError(() =>
      new HttpErrorResponse({ status: 400, error: { message: 'Date invalide.' } })));
    const fixture = TestBed.createComponent(RecordMaintenancePageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.setValue({
      type: 'OIL_CHANGE', completedDate: component.maxDate,
      mileageAtMaintenance: 100600, costAmount: 10000,
    });

    component.submit();

    expect(component.submitError()).toBe('Date invalide.');
    expect(component.form.controls.mileageAtMaintenance.value).toBe(100600);
    expect(component.submitting()).toBe(false);
  });
});

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { MaintenanceScheduleService } from '../../../core/services/maintenance-schedule.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { VehicleMaintenancePlansPageComponent } from './vehicle-maintenance-plans-page.component';

describe('VehicleMaintenancePlansPageComponent', () => {
  const vehicles = { getById: vi.fn() };
  const schedules = { findByVehicle: vi.fn(), create: vi.fn(), activate: vi.fn(), deactivate: vi.fn() };
  const auth = { isAdmin: vi.fn(), hasRole: vi.fn() };
  const plan = {
    id: 7, vehicleId: 1, type: 'OIL_CHANGE', status: 'ACTIVE' as const,
    frequencyMileage: 10000, frequencyMonths: 12,
    lastMaintenanceMileage: 101000, lastMaintenanceDate: '2026-10-14',
    nextDueMileage: 111000, nextDueDate: '2027-10-14',
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    vehicles.getById.mockReturnValue(of({ id: 1, brand: 'Toyota', model: 'Yaris',
      registrationNumber: '033830', year: 2004, currentMileage: 101000 }));
    schedules.findByVehicle.mockReturnValue(of([plan]));
    schedules.create.mockReturnValue(of(plan));
    schedules.deactivate.mockReturnValue(of({ ...plan, status: 'INACTIVE' }));
    schedules.activate.mockReturnValue(of(plan));
    auth.isAdmin.mockReturnValue(true);
    auth.hasRole.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [VehicleMaintenancePlansPageComponent],
      providers: [provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ vehicleId: '1' }) } } },
        { provide: VehicleService, useValue: vehicles },
        { provide: MaintenanceScheduleService, useValue: schedules },
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();
  });

  it('loads and displays the plans of the selected vehicle', async () => {
    const fixture = TestBed.createComponent(VehicleMaintenancePlansPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(schedules.findByVehicle).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.textContent).toContain('Vidange');
    expect(fixture.nativeElement.textContent).toContain('111,000 km');
    expect(fixture.nativeElement.textContent).toContain('À jour');
  });

  it('creates a new plan using both frequencies', () => {
    schedules.findByVehicle.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(VehicleMaintenancePlansPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({ type: 'OIL_CHANGE', frequencyMileage: 10000, frequencyMonths: 12 });
    fixture.componentInstance.createPlan();

    expect(schedules.create).toHaveBeenCalledWith({ vehicleId: 1, type: 'OIL_CHANGE',
      frequencyMileage: 10000, frequencyMonths: 12 });
    expect(schedules.findByVehicle).toHaveBeenCalledTimes(2);
  });

  it('rejects a plan without either frequency', () => {
    schedules.findByVehicle.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(VehicleMaintenancePlansPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.controls.type.setValue('OIL_CHANGE');
    fixture.componentInstance.createPlan();

    expect(schedules.create).not.toHaveBeenCalled();
    expect(fixture.componentInstance.actionError()).toContain('au moins une fréquence');
  });

  it('hides management actions for a read-only user', async () => {
    auth.isAdmin.mockReturnValue(false);
    const fixture = TestBed.createComponent(VehicleMaintenancePlansPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('réservée à l’administrateur');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    fixture.componentInstance.changeStatus(plan);
    expect(schedules.deactivate).not.toHaveBeenCalled();
  });

  it('deactivates a plan and reloads the list', () => {
    const fixture = TestBed.createComponent(VehicleMaintenancePlansPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.changeStatus(plan);

    expect(schedules.deactivate).toHaveBeenCalledWith(7);
    expect(schedules.findByVehicle).toHaveBeenCalledTimes(2);
  });
});

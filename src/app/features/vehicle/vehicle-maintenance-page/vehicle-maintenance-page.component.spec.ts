import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { VehicleMaintenancePageComponent } from './vehicle-maintenance-page.component';
import { AuthService } from '../../../core/auth/auth.service';

describe('VehicleMaintenancePageComponent', () => {
  const vehicleService = { getById: vi.fn() };
  const maintenanceService = { findByVehicle: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    vehicleService.getById.mockReturnValue(of({
      id: 1, brand: 'Toyota', model: 'Yaris', registrationNumber: '033830',
      year: 2004, currentMileage: 101000,
    }));
    maintenanceService.findByVehicle.mockReturnValue(of({
      content: [
        { id: 2, vehicleId: 1, type: 'OIL_CHANGE', status: 'COMPLETED',
          completedDate: '2026-10-14', mileageAtMaintenance: 100600, costAmount: 10000 },
        { id: 1, vehicleId: 1, type: 'OIL_CHANGE', status: 'COMPLETED',
          completedDate: '2026-10-14', mileageAtMaintenance: 101000, costAmount: 30000 },
      ],
      page: 0, size: 10, totalElements: 2, totalPages: 1, last: true,
    }));

    await TestBed.configureTestingModule({
      imports: [VehicleMaintenancePageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ vehicleId: '1' }) } } },
        { provide: VehicleService, useValue: vehicleService },
        { provide: MaintenanceService, useValue: maintenanceService },
        { provide: AuthService, useValue: { isAdmin: () => true } },
      ],
    }).compileComponents();
  });

  it('should display the vehicle and server history in returned order', async () => {
    const fixture = TestBed.createComponent(VehicleMaintenancePageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(vehicleService.getById).toHaveBeenCalledWith(1);
    expect(maintenanceService.findByVehicle).toHaveBeenCalledWith(1, 0, 10);
    expect(fixture.nativeElement.querySelector('a[href="/vehicles/1/maintenances/new"]')).toBeTruthy();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Toyota Yaris');
    expect(fixture.nativeElement.querySelector('app-vehicle-page-header .vehicle-icon')).toBeTruthy();
    expect(text).toContain('Vidange');
    expect(text).toContain('Terminée');
    expect(text).toContain('101,000 km');
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('100,600');
    expect(rows[1].textContent).toContain('101,000');
    expect(rows[0].textContent).toContain('Voir / rectifier');
  });

  it('should request the selected server page', () => {
    const fixture = TestBed.createComponent(VehicleMaintenancePageComponent);
    fixture.detectChanges();
    fixture.componentInstance.onPageChange({ pageIndex: 1, pageSize: 5, length: 12 });

    expect(maintenanceService.findByVehicle).toHaveBeenLastCalledWith(1, 1, 5);
    expect(fixture.componentInstance.pageIndex()).toBe(1);
  });

  it('should display an empty state', async () => {
    maintenanceService.findByVehicle.mockReturnValue(of({
      content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, last: true,
    }));
    const fixture = TestBed.createComponent(VehicleMaintenancePageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucun entretien enregistré');
  });

  it('should display an error when history fails', async () => {
    maintenanceService.findByVehicle.mockReturnValue(throwError(() => new Error('Network error')));
    const fixture = TestBed.createComponent(VehicleMaintenancePageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Impossible de charger l’historique');
  });
});

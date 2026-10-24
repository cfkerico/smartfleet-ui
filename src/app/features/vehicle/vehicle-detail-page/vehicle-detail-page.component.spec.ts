import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { VehicleDetailPageComponent } from './vehicle-detail-page.component';

describe('VehicleDetailPageComponent', () => {
  const vehicle: Vehicle = {
    id: 9, brand: 'Toyota', model: 'Yaris', label: 'Toyota Yaris', year: 2004,
    vehicleStatus: 'AVAILABLE', fuelType: 'ESSENCE', vin: 'VIN-9',
    registrationNumber: 'CE 135 FG', acquisitionMileage: 100000, currentMileage: 101000,
  };
  const getById = vi.fn();
  const open = vi.fn(() => ({ afterClosed: () => of(false) }));

  async function create(id: string | null) {
    await TestBed.configureTestingModule({
      imports: [VehicleDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(id === null ? {} : { vehicleId: id }) } } },
        { provide: VehicleService, useValue: { getById } },
        { provide: MatDialog, useValue: { open } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(VehicleDetailPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    getById.mockReset();
    open.mockClear();
  });

  it('loads the vehicle and links to its existing pages', async () => {
    getById.mockReturnValue(of(vehicle));
    const fixture = await create('9');
    expect(getById).toHaveBeenCalledExactlyOnceWith(9);
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Toyota Yaris');
    for (const path of ['/vehicles/9/documents', '/vehicles/9/maintenances', '/vehicles/9/maintenance-plans']) {
      expect(fixture.nativeElement.querySelector(`a[href="${path}"]`)).toBeTruthy();
    }
  });

  it('opens assignment creation with this vehicle preselected', async () => {
    getById.mockReturnValue(of(vehicle));
    const fixture = await create('9');
    fixture.componentInstance.openAssignment();
    expect(open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      data: { mode: 'CREATE', preselectedVehicle: vehicle },
    }));
    fixture.componentInstance.vehicle.set({ ...vehicle, vehicleStatus: 'INACTIVE' });
    fixture.componentInstance.openAssignment();
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid route id without calling the API', async () => {
    const fixture = await create('0');
    expect(getById).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Identifiant du véhicule invalide');
  });

  it('shows an error if the vehicle cannot be loaded', async () => {
    getById.mockReturnValue(throwError(() => new Error('not found')));
    const fixture = await create('9');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Impossible de charger');
  });
});

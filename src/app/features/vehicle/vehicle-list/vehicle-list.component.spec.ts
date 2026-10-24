import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';

import { VehicleListComponent } from './vehicle-list.component';

import { provideRouter } from '@angular/router';

describe('VehicleListComponent', () => {
  let component: VehicleListComponent;
  let fixture: ComponentFixture<VehicleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleListComponent],
      providers: [
        provideRouter([]),
        {
          provide: VehicleService,
          useValue: {
            getAll: () => of({ content: [], totalElements: 0 }),
            deactivate: () => of(undefined),
            reactivate: () => of(undefined),
          },
        },
        { provide: NotificationService, useValue: { error: () => undefined, success: () => undefined } },
        { provide: ConfirmationService, useValue: { confirm: () => of(true) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should request the selected server page without local pagination', () => {
    const service = TestBed.inject(VehicleService);
    const getAll = vi.spyOn(service, 'getAll');

    component.onPageChange({ pageIndex: 1, pageSize: 10, length: 25 });

    expect(getAll).toHaveBeenCalledWith(1, 10);
    expect(component.vehicles.paginator).toBeUndefined();
    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(10);
  });

  it('should display the shared list layout and empty state', () => {
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.page-header h1')?.textContent?.trim()).toBe('Véhicules');
    expect(element.querySelector('.list-search')).toBeTruthy();
    expect(element.querySelector('.table-card .table-scroll')).toBeTruthy();
    expect(element.querySelector('.empty-state')?.textContent).toContain(
      'Aucun élément à afficher.',
    );
  });

  it('should provide a maintenance history link for each vehicle', () => {
    component.vehicles.data = [{
      id: 1, brand: 'Toyota', model: 'Yaris', label: 'Toyota Yaris', year: 2004,
      vehicleStatus: 'AVAILABLE', fuelType: 'ESSENCE', vin: 'VIN-1', registrationNumber: '033830',
    }];
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a[aria-label="Entretien du véhicule Toyota Yaris"]');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/vehicles/1/maintenances');
  });

  it('should link to the selected vehicle detail', () => {
    component.vehicles.data = [{
      id: 9, brand: 'Toyota', model: 'Yaris', label: 'Toyota Yaris', year: 2004,
      vehicleStatus: 'AVAILABLE', fuelType: 'ESSENCE', vin: 'VIN-9', registrationNumber: 'CE 135 FG',
    }];
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a[aria-label="Détail du véhicule Toyota Yaris"]');
    expect(link?.getAttribute('href')).toBe('/vehicles/9');
  });

  it('should deactivate an available vehicle only after confirmation', () => {
    const vehicle = {
      id: 1, brand: 'Toyota', model: 'Yaris', label: 'Toyota Yaris', year: 2004,
      vehicleStatus: 'AVAILABLE', fuelType: 'ESSENCE', vin: 'VIN-1', registrationNumber: '033830',
    };
    const service = TestBed.inject(VehicleService);
    const deactivate = vi.spyOn(service, 'deactivate').mockReturnValue(of(undefined));
    const getAll = vi.spyOn(service, 'getAll');
    component.vehicles.data = [vehicle];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[aria-label="Désactiver le véhicule"]')).toBeTruthy();
    component.deactivate(vehicle);

    expect(deactivate).toHaveBeenCalledWith(1);
    expect(getAll).toHaveBeenCalled();
  });

  it('should reactivate an inactive vehicle', () => {
    const vehicle = {
      id: 2, brand: 'Toyota', model: 'Yaris', label: 'Toyota Yaris', year: 2004,
      vehicleStatus: 'INACTIVE', fuelType: 'ESSENCE', vin: 'VIN-2', registrationNumber: '033831',
    };
    const service = TestBed.inject(VehicleService);
    const reactivate = vi.spyOn(service, 'reactivate').mockReturnValue(of(undefined));
    component.vehicles.data = [vehicle];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[aria-label="Réactiver le véhicule"]')).toBeTruthy();
    component.reactivate(vehicle);

    expect(reactivate).toHaveBeenCalledWith(2);
  });
});

import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Vehicle } from '../../models/vehicle';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { VehicleService } from './vehicle.service';

describe('VehicleService', () => {
  let service: VehicleService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VehicleService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(VehicleService);
    httpTestingController =
      TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should find a vehicle by identifier', () => {
    const response: Vehicle = {
      id: 10,
      brand: 'Toyota',
      model: 'Corolla',
      label: 'Toyota Corolla 2026 CA-123-AB',
      year: 2026,
      vehicleStatus: 'ACTIVE',
      fuelType: 'DIESEL',
      vin: 'VIN-123456',
      registrationNumber: 'CA-123-AB',
    };

    service.getById(10).subscribe(vehicle => {
      expect(vehicle).toEqual(response);
      expect(vehicle.id).toBe(10);
      expect(vehicle.year).toBe(2026);
    });

    const request = httpTestingController.expectOne(
      `${API_ENDPOINTS.vehicles}/10`
    );

    expect(request.request.method).toBe('GET');

    request.flush(response);
  });

  it('should update vehicle details without creating a new vehicle', () => {
    const details = {
      brand: 'Toyota', model: 'Yaris', year: 2004, fuelType: 'ESSENCE',
      transmission: 'MANUAL', vin: 'VIN-1', registrationNumber: '033830',
    };
    service.update(7, details).subscribe();

    const request = httpTestingController.expectOne(`${API_ENDPOINTS.vehicles}/7`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(details);
    request.flush(null);
  });

  it('should deactivate and reactivate the same vehicle', () => {
    service.deactivate(7).subscribe();
    const deactivate = httpTestingController.expectOne(`${API_ENDPOINTS.vehicles}/7`);
    expect(deactivate.request.method).toBe('DELETE');
    deactivate.flush(null);

    service.reactivate(7).subscribe();
    const reactivate = httpTestingController.expectOne(`${API_ENDPOINTS.vehicles}/7/reactivate`);
    expect(reactivate.request.method).toBe('PUT');
    reactivate.flush(null);
  });
});

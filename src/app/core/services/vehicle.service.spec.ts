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
});
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { MaintenanceService } from './maintenance.service';

describe('MaintenanceService', () => {
  it('should send vehicle and server pagination parameters', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(MaintenanceService);
    const http = TestBed.inject(HttpTestingController);
    const response = { content: [], page: 1, size: 5, totalElements: 0, totalPages: 0, last: true };
    let actual = null;

    service.findByVehicle(10, 1, 5).subscribe(result => actual = result);

    const request = http.expectOne(req => req.url === API_ENDPOINTS.maintenances);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('vehicleId')).toBe('10');
    expect(request.request.params.get('page')).toBe('1');
    expect(request.request.params.get('size')).toBe('5');
    request.flush(response);
    expect(actual).toEqual(response);
    http.verify();
  });
});

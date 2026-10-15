import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { MaintenanceScheduleService } from './maintenance-schedule.service';

describe('MaintenanceScheduleService', () => {
  let service: MaintenanceScheduleService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MaintenanceScheduleService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('reads plans for the selected vehicle without sending a company id', () => {
    const plans: never[] = [];
    service.findByVehicle(7).subscribe(result => expect(result).toEqual(plans));

    const request = http.expectOne(req => req.url === API_ENDPOINTS.maintenanceSchedules);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('vehicleId')).toBe('7');
    expect(request.request.params.keys()).toEqual(['vehicleId']);
    request.flush(plans);
  });

  it('creates a plan with the configured frequencies', () => {
    const payload = { vehicleId: 7, type: 'OIL_CHANGE', frequencyMileage: 10000, frequencyMonths: 12 };
    service.create(payload).subscribe(result => expect(result.id).toBe(3));

    const request = http.expectOne(API_ENDPOINTS.maintenanceSchedules);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 3, ...payload, status: 'ACTIVE' }, { status: 201, statusText: 'Created' });
  });

  it('uses the status endpoints without putting a plan body in the request', () => {
    service.deactivate(3).subscribe(result => expect(result.status).toBe('INACTIVE'));
    const deactivate = http.expectOne(`${API_ENDPOINTS.maintenanceSchedules}/3/deactivate`);
    expect(deactivate.request.method).toBe('POST');
    expect(deactivate.request.body).toEqual({});
    deactivate.flush({ id: 3, status: 'INACTIVE' });

    service.activate(3).subscribe(result => expect(result.status).toBe('ACTIVE'));
    const activate = http.expectOne(`${API_ENDPOINTS.maintenanceSchedules}/3/activate`);
    expect(activate.request.method).toBe('POST');
    expect(activate.request.body).toEqual({});
    activate.flush({ id: 3, status: 'ACTIVE' });
  });
});

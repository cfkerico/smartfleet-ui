import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { VehicleService } from '../../../core/services/vehicle.service';
import { DocumentApiService } from '../../documents/services/document-api.service';
import { VehicleDocumentPageComponent } from './vehicle-document-page.component';
import { Snapshots } from 'vitest';

describe('VehicleDocumentPageComponent', () => {
  let component: VehicleDocumentPageComponent;
  let fixture: ComponentFixture<VehicleDocumentPageComponent>;

  const vehicleServiceMock = {
    getById: vi.fn(),
  };

  const documentApiServiceMock = {
    findCompliance: vi.fn(),
  };

  beforeEach(async () => {
    vehicleServiceMock.getById.mockReturnValue(of({
      id: 10,
      brand: 'Toyota',
      model: 'Corolla',
      label: 'Toyota Corolla 2026 CA-123-AB',
      year: 2026,
      vehicleStatus: 'ACTIVE',
      fuelType: 'DIESEL',
      vin: 'VIN-123456',
      registrationNumber: 'CA-123-AB'
    }));

    documentApiServiceMock.findCompliance.mockReturnValue(of({
      ownerType: 'VEHICLE',
      ownerId: 10,
      referenceDate: '2026-08-21',

      totalRequired: 0,
      complianceRequired: 0,
      missingRequired: 0,
      expiredRequired: 0,
      expiringSoon: 0,
      compliant: true,
      blocked: false,
      items: []
    }));


    await TestBed.configureTestingModule({
      imports: [VehicleDocumentPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                vehicleId: '10'
              }),
            },
          },
        },
        {
          provide: VehicleService,
          useValue: vehicleServiceMock
        },
        {
          provide: DocumentApiService,
          useValue: documentApiServiceMock
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleDocumentPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  })

  it('should load  the vehicle and its document compliance', () => {
    expect(vehicleServiceMock.getById).toHaveBeenCalledWith(10);

    expect(documentApiServiceMock.findCompliance).toHaveBeenCalledWith('VEHICLE', 10);

    expect(component.vehicleId()).toBe(10);
    expect(component.vehicle()?.brand).toBe('Toyota');
    expect(component.loading()).toBe(false);

    const content = fixture.nativeElement.textContent as string;

    expect(content).toContain('Toyota');
    expect(content).toContain('Corolla');
    expect(content).toContain('Conformité documentaire');
  });
});

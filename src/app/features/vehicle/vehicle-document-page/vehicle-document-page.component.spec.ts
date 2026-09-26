import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { VehicleService } from '../../../core/services/vehicle.service';
import { DocumentApiService } from '../../documents/services/document-api.service';
import { VehicleDocumentPageComponent } from './vehicle-document-page.component';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../core/services/notification.service';
import { DocumentDetailDialogComponent } from '../../documents/dialogs/document-detail-dialog/document-detail-dialog.component';
import { OwnerDocumentComplianceComponent } from '../../documents/components/owner-document-compliance/owner-document-compliance.component';
import { OwnerArchivedDocumentListComponent } from '../../documents/components/owner-archived-document-list/owner-archived-document-list.component';
import { By } from '@angular/platform-browser';

describe('VehicleDocumentPageComponent', () => {
  let component: VehicleDocumentPageComponent;
  let fixture: ComponentFixture<VehicleDocumentPageComponent>;

  const vehicleServiceMock = {
    getById: vi.fn(),
  };

  const documentApiServiceMock = {
    findCompliance: vi.fn(),
    findByOwner: vi.fn()
  };

  const detailDialogRefMock = {
    afterClosed: vi.fn()
  };

  const matDialogMock = {
    open: vi.fn()
  };

  const notificationMock = {
    success: vi.fn(),
    error: vi.fn()
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
      compliantRequired: 0,
      missingRequired: 0,
      expiredRequired: 0,
      expiringSoon: 0,
      compliant: true,
      blocked: false,
      items: []
    }));

    documentApiServiceMock.findByOwner.mockReturnValue(of({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      last: true
    }));

    detailDialogRefMock.afterClosed.mockReturnValue(of(true));
    matDialogMock.open.mockReturnValue(detailDialogRefMock);


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
        {
          provide: MatDialog,
          useValue: matDialogMock
        },
        {
          provide: NotificationService,
          useValue: notificationMock
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleDocumentPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should load the vehicle and its document compliance', () => {
    expect(vehicleServiceMock.getById).toHaveBeenCalledWith(10);

    expect(documentApiServiceMock.findCompliance).toHaveBeenCalledWith('VEHICLE', 10);

    expect(component.vehicleId()).toBe(10);
    expect(component.vehicle()?.brand).toBe('Toyota');
    expect(component.loading()).toBe(false);

    const content = fixture.nativeElement.textContent as string;

    expect(content).toContain('Toyota');
    expect(content).toContain('Corolla');
    expect(content).toContain('Conformité documentaire');

    expect(documentApiServiceMock.findByOwner).toHaveBeenCalledWith({
      ownerType: 'VEHICLE',
      ownerId: 10,
      status: 'ARCHIVED',
      page: 0,
      size: 10
    });
  });

  it('should notify and reload compliance after archiving a document', () => {
    const complianceComponent =
      fixture.debugElement.query(
        By.directive(OwnerDocumentComplianceComponent)
      ).componentInstance as OwnerDocumentComplianceComponent;

    const archivedDocumentListComponent = 
      fixture.debugElement.query(
        By.directive(OwnerArchivedDocumentListComponent)
      ).componentInstance as OwnerArchivedDocumentListComponent;

    const reloadSpy = vi.spyOn(complianceComponent, 'reload');
    const archiveReloadSpy = vi.spyOn(archivedDocumentListComponent, 'reload');

    component.viewDocument({
      requirementId: 100,
      documentTypeId: 200,
      documentTypeCode: 'VEHICLE_INSURANCE',
      documentTypeLabel: 'Assurance automobile',
      required: true,
      expirationRequired: true,
      displayOrder: 1,
      complianceStatus: 'VALID',
      blocking: false,
      documentId: 300,
      documentTitle: 'Assurance automobile 2027',
      activeVersionId: 401,
      currentVersionNumber: 2,
      issuedDate: '2027-08-01',
      expirationDate: '2028-08-01',
      daysUntilExpiration: 343
    });

    expect(matDialogMock.open).toHaveBeenCalledWith(
      DocumentDetailDialogComponent,
      expect.objectContaining({
        data: {
          documentId: 300,
          documentTypeLabel: 'Assurance automobile'
        }
      })
    );

    expect(notificationMock.success)
      .toHaveBeenCalledWith('Document archivé avec succès.');

    expect(reloadSpy).toHaveBeenCalled();
    expect(archiveReloadSpy).toHaveBeenCalled();
  });

});

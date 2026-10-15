import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { NotificationService } from '../../../core/services/notification.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { OwnerArchivedDocumentListComponent } from '../../documents/components/owner-archived-document-list/owner-archived-document-list.component';
import { OwnerDocumentComplianceComponent } from '../../documents/components/owner-document-compliance/owner-document-compliance.component';
import { CreateOwnerDocumentDialogComponent } from '../../documents/dialogs/create-owner-document-dialog/create-owner-document-dialog.component';
import { DocumentDetailDialogComponent } from '../../documents/dialogs/document-detail-dialog/document-detail-dialog.component';
import { DocumentComplianceItem } from '../../documents/models/document.model';
import { DocumentApiService } from '../../documents/services/document-api.service';
import { MaintenanceDocumentPageComponent } from './maintenance-document-page.component';

describe('MaintenanceDocumentPageComponent', () => {
  const routeIds = { vehicleId: '1', maintenanceId: '10' };
  const vehicles = { getById: vi.fn() };
  const maintenances = { findById: vi.fn() };
  const documents = { findCompliance: vi.fn(), findByOwner: vi.fn() };
  const dialog = { open: vi.fn() };
  const notification = { success: vi.fn(), error: vi.fn() };
  const maintenance = { id: 10, vehicleId: 1, type: 'OIL_CHANGE', status: 'COMPLETED',
    completedDate: '2026-10-14', mileageAtMaintenance: 101000, costAmount: 30000,
    revisionNumber: 0 };
  const item: DocumentComplianceItem = {
    requirementId: 20, documentTypeId: 30, documentTypeCode: 'GARAGE_INVOICE',
    documentTypeLabel: 'Facture du garage', required: true, expirationRequired: false,
    displayOrder: 1, complianceStatus: 'MISSING', blocking: false, documentId: null,
    documentTitle: null, activeVersionId: null, currentVersionNumber: null,
    issuedDate: null, expirationDate: null, daysUntilExpiration: null,
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    routeIds.vehicleId = '1';
    routeIds.maintenanceId = '10';
    vehicles.getById.mockReturnValue(of({ id: 1, brand: 'Toyota', model: 'Yaris',
      registrationNumber: '033830', year: 2004, currentMileage: 101000 }));
    maintenances.findById.mockReturnValue(of(maintenance));
    documents.findCompliance.mockReturnValue(of({ ownerType: 'MAINTENANCE', ownerId: 10,
      referenceDate: '2026-10-15', totalRequired: 1, compliantRequired: 0,
      missingRequired: 1, expiredRequired: 0, expiringSoon: 0, compliant: false,
      blocked: false, items: [item] }));
    documents.findByOwner.mockReturnValue(of({ content: [], page: 0, size: 10,
      totalElements: 0, totalPages: 0, last: true }));

    await TestBed.configureTestingModule({
      imports: [MaintenanceDocumentPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: {
          get: (key: string) => convertToParamMap(routeIds).get(key),
        } } } },
        { provide: VehicleService, useValue: vehicles },
        { provide: MaintenanceService, useValue: maintenances },
        { provide: DocumentApiService, useValue: documents },
        { provide: MatDialog, useValue: dialog },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();
  });

  async function createPage() {
    const fixture = TestBed.createComponent(MaintenanceDocumentPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('loads the maintenance and requests its compliance and archives', async () => {
    const fixture = await createPage();

    expect(vehicles.getById).toHaveBeenCalledWith(1);
    expect(maintenances.findById).toHaveBeenCalledWith(10);
    expect(documents.findCompliance).toHaveBeenCalledWith('MAINTENANCE', 10);
    expect(documents.findByOwner).toHaveBeenCalledWith({ ownerType: 'MAINTENANCE',
      ownerId: 10, status: 'ARCHIVED', page: 0, size: 10 });
    expect(fixture.nativeElement.textContent).toContain('Facture du garage');
    expect(fixture.nativeElement.querySelector('a[href="/vehicles/1/maintenances"]')).toBeTruthy();
  });

  it('does not display documents when maintenance belongs to another vehicle', async () => {
    maintenances.findById.mockReturnValue(of({ ...maintenance, vehicleId: 2 }));
    const fixture = await createPage();

    expect(fixture.nativeElement.textContent).toContain('ne correspond pas au véhicule');
    expect(documents.findCompliance).not.toHaveBeenCalled();
    expect(documents.findByOwner).not.toHaveBeenCalled();
  });

  it('does not request documents when loading maintenance fails', async () => {
    maintenances.findById.mockReturnValue(throwError(() => new Error('Not found')));
    const fixture = await createPage();

    expect(fixture.nativeElement.textContent).toContain('Impossible de charger');
    expect(documents.findCompliance).not.toHaveBeenCalled();
  });

  it('opens creation for the maintenance owner and refreshes compliance', async () => {
    const fixture = await createPage();
    const compliance = fixture.debugElement.query(By.directive(OwnerDocumentComplianceComponent))
      .componentInstance as OwnerDocumentComplianceComponent;
    const reload = vi.spyOn(compliance, 'reload');
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    fixture.componentInstance.addDocument(item);

    expect(dialog.open).toHaveBeenCalledWith(CreateOwnerDocumentDialogComponent,
      expect.objectContaining({ data: { ownerType: 'MAINTENANCE', ownerId: 10, item } }));
    expect(reload).toHaveBeenCalledOnce();
  });

  it('refreshes compliance and archives after archiving a document', async () => {
    const fixture = await createPage();
    const compliance = fixture.debugElement.query(By.directive(OwnerDocumentComplianceComponent))
      .componentInstance as OwnerDocumentComplianceComponent;
    const archives = fixture.debugElement.query(By.directive(OwnerArchivedDocumentListComponent))
      .componentInstance as OwnerArchivedDocumentListComponent;
    const reloadCompliance = vi.spyOn(compliance, 'reload');
    const reloadArchives = vi.spyOn(archives, 'reload');
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    fixture.componentInstance.viewDocument({ ...item, documentId: 40 });

    expect(dialog.open).toHaveBeenCalledWith(DocumentDetailDialogComponent,
      expect.objectContaining({ data: { documentId: 40, documentTypeLabel: 'Facture du garage' } }));
    expect(reloadCompliance).toHaveBeenCalledOnce();
    expect(reloadArchives).toHaveBeenCalledOnce();
  });
});

import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { DriverService } from '../../../core/services/driver.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DocumentApiService } from '../../documents/services/document-api.service';
import { DriverDocumentPageComponent } from './driver-document-page.component';
import { By } from '@angular/platform-browser';
import { DocumentDetailDialogComponent } from '../../documents/dialogs/document-detail-dialog/document-detail-dialog.component';
import { OwnerDocumentComplianceComponent } from '../../documents/components/owner-document-compliance/owner-document-compliance.component';
import { OwnerArchivedDocumentListComponent } from '../../documents/components/owner-archived-document-list/owner-archived-document-list.component';
import { CreateOwnerDocumentDialogComponent } from '../../documents/dialogs/create-owner-document-dialog/create-owner-document-dialog.component';
import { AddDocumentVersionDialogComponent } from '../../documents/dialogs/add-document-version-dialog/add-document-version-dialog.component';

describe('DriverDocumentPageComponent', () => {
  const driverServiceMock = {
    getById: vi.fn(),
  };

  const documentApiMock = {
    findCompliance: vi.fn(),
    findByOwner: vi.fn(),
  };

  const matDialogMock = {
    open: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    driverServiceMock.getById.mockReturnValue(of({
      id: 10,
      fullName: 'Dupont Jean',
      licenseNumber: 'PERMIS-001',
      mobilePhoneNumber: '0600000000',
    }));

    documentApiMock.findCompliance.mockReturnValue(of({
      ownerType: 'DRIVER',
      ownerId: 10,
      referenceDate: '2026-09-27',
      totalRequired: 0,
      compliantRequired: 0,
      missingRequired: 0,
      expiredRequired: 0,
      expiringSoon: 0,
      compliant: true,
      blocked: false,
      items: [],
    }));

    documentApiMock.findByOwner.mockReturnValue(of({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      last: true,
    }));

    await TestBed.configureTestingModule({
      imports: [DriverDocumentPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ driverId: '10' }),
            },
          },
        },
        { provide: DriverService, useValue: driverServiceMock },
        { provide: DocumentApiService, useValue: documentApiMock },
        {
          provide: NotificationService,
          useValue: { success: vi.fn(), error: vi.fn() },
        },
        { provide: MatDialog, useValue: matDialogMock },
      ],
    }).compileComponents();
  });

  it('should load the driver, compliance and archived documents', async () => {
    const fixture = TestBed.createComponent(DriverDocumentPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(driverServiceMock.getById).toHaveBeenCalledWith(10);
    expect(component.driverId()).toBe(10);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();

    expect(documentApiMock.findCompliance)
      .toHaveBeenCalledWith('DRIVER', 10);

    expect(documentApiMock.findByOwner).toHaveBeenCalledWith({
      ownerType: 'DRIVER',
      ownerId: 10,
      status: 'ARCHIVED',
      page: 0,
      size: 10,
    });

    const content = fixture.nativeElement.textContent as string;
    expect(content).toContain('Dupont Jean');
    expect(content).toContain('Conformité documentaire');
    expect(content).toContain('Documents archivés');
  });

  it('should show an error when the driver cannot be loaded', async () => {
    driverServiceMock.getById.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    const fixture = TestBed.createComponent(DriverDocumentPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.driver()).toBeNull();
    expect(component.loading()).toBe(false);
    expect(component.error()).toBe(
      'Impossible de charger les informations du chauffeur.'
    );

    const content = fixture.nativeElement.textContent as string;
    expect(content).toContain('Chauffeur indisponible');
    expect(documentApiMock.findCompliance).not.toHaveBeenCalled();
    expect(documentApiMock.findByOwner).not.toHaveBeenCalled();
  });

  it('should reload compliance and archives after archiving a document', async () => {
    const fixture = TestBed.createComponent(DriverDocumentPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compliance = fixture.debugElement.query(
      By.directive(OwnerDocumentComplianceComponent)
    ).componentInstance as OwnerDocumentComplianceComponent;

    const archives = fixture.debugElement.query(
      By.directive(OwnerArchivedDocumentListComponent)
    ).componentInstance as OwnerArchivedDocumentListComponent;

    const reloadCompliance = vi.spyOn(compliance, 'reload');
    const reloadArchives = vi.spyOn(archives, 'reload');
    const notification = TestBed.inject(NotificationService);
    const notifySuccess = vi.spyOn(notification, 'success');

    matDialogMock.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    component.viewDocument({
      requirementId: 100,
      documentTypeId: 200,
      documentTypeCode: 'DRIVER_LICENSE',
      documentTypeLabel: 'Permis de conduire',
      required: true,
      expirationRequired: true,
      displayOrder: 1,
      complianceStatus: 'VALID',
      blocking: false,
      documentId: 300,
      documentTitle: 'Permis de conduire',
      activeVersionId: 401,
      currentVersionNumber: 1,
      issuedDate: '2026-01-01',
      expirationDate: '2030-12-31',
      daysUntilExpiration: 100,
    });

    expect(matDialogMock.open).toHaveBeenCalledWith(
      DocumentDetailDialogComponent,
      expect.objectContaining({
        data: {
          documentId: 300,
          documentTypeLabel: 'Permis de conduire',
        },
      })
    );
    expect(notifySuccess)
      .toHaveBeenCalledWith('Document archivé avec succès.');
    expect(reloadCompliance).toHaveBeenCalledOnce();
    expect(reloadArchives).toHaveBeenCalledOnce();
  });

  it('should create a document for the driver and reload compliance', async () => {
    const fixture = TestBed.createComponent(DriverDocumentPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compliance = fixture.debugElement.query(
      By.directive(OwnerDocumentComplianceComponent)
    ).componentInstance as OwnerDocumentComplianceComponent;

    const reloadCompliance = vi.spyOn(compliance, 'reload');
    const notifySuccess = vi.spyOn(
      TestBed.inject(NotificationService),
      'success'
    );

    matDialogMock.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    const missingItem = {
      requirementId: 100,
      documentTypeId: 200,
      documentTypeCode: 'DRIVER_LICENSE',
      documentTypeLabel: 'Permis de conduire',
      required: true,
      expirationRequired: true,
      displayOrder: 1,
      complianceStatus: 'MISSING' as const,
      blocking: true,
      documentId: null,
      documentTitle: null,
      activeVersionId: null,
      currentVersionNumber: null,
      issuedDate: null,
      expirationDate: null,
      daysUntilExpiration: null,
    };

    component.addDocument(missingItem);

    expect(matDialogMock.open).toHaveBeenCalledWith(
      CreateOwnerDocumentDialogComponent,
      expect.objectContaining({
        data: {
          ownerType: 'DRIVER',
          ownerId: 10,
          item: missingItem,
        },
      })
    );
    expect(notifySuccess)
      .toHaveBeenCalledWith('Document ajouté avec succès.');
    expect(reloadCompliance).toHaveBeenCalledOnce();
  });

  it('should replace a driver document and reload compliance', async () => {
    const fixture = TestBed.createComponent(DriverDocumentPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compliance = fixture.debugElement.query(
      By.directive(OwnerDocumentComplianceComponent)
    ).componentInstance as OwnerDocumentComplianceComponent;

    const reloadCompliance = vi.spyOn(compliance, 'reload');
    const notifySuccess = vi.spyOn(
      TestBed.inject(NotificationService),
      'success'
    );

    matDialogMock.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    const item = {
      requirementId: 100,
      documentTypeId: 200,
      documentTypeCode: 'DRIVER_LICENSE',
      documentTypeLabel: 'Permis de conduire',
      required: true,
      expirationRequired: true,
      displayOrder: 1,
      complianceStatus: 'VALID' as const,
      blocking: false,
      documentId: 300,
      documentTitle: 'Permis de conduire',
      activeVersionId: 401,
      currentVersionNumber: 1,
      issuedDate: '2026-01-01',
      expirationDate: '2030-12-31',
      daysUntilExpiration: 100,
    };

    component.replaceDocument(item);

    expect(matDialogMock.open).toHaveBeenCalledWith(
      AddDocumentVersionDialogComponent,
      expect.objectContaining({
        data: { item },
      })
    );
    expect(notifySuccess)
      .toHaveBeenCalledWith('Nouvelle version ajoutée avec succès.');
    expect(reloadCompliance).toHaveBeenCalledOnce();
  });


});
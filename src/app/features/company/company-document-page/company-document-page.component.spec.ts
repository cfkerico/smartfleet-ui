import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { CompanyApiService } from '../../../core/services/company-api-service';
import { NotificationService } from '../../../core/services/notification.service';
import { CompanyView } from '../../../models/company.model';
import { DocumentComplianceItem, DocumentSummary } from '../../documents/models/document.model';
import { DocumentApiService } from '../../documents/services/document-api.service';
import { OwnerDocumentComplianceComponent } from '../../documents/components/owner-document-compliance/owner-document-compliance.component';
import { OwnerArchivedDocumentListComponent } from '../../documents/components/owner-archived-document-list/owner-archived-document-list.component';
import { CreateOwnerDocumentDialogComponent } from '../../documents/dialogs/create-owner-document-dialog/create-owner-document-dialog.component';
import { AddDocumentVersionDialogComponent } from '../../documents/dialogs/add-document-version-dialog/add-document-version-dialog.component';
import { DocumentDetailDialogComponent } from '../../documents/dialogs/document-detail-dialog/document-detail-dialog.component';
import { CompanyDocumentPageComponent } from './company-document-page.component';

describe('CompanyDocumentPageComponent', () => {
  const companyApiMock = { findMyCompany: vi.fn() };
  const documentApiMock = { findCompliance: vi.fn(), findByOwner: vi.fn() };
  const dialogMock = { open: vi.fn() };
  const notificationMock = { success: vi.fn(), error: vi.fn() };

  const company: CompanyView = {
    id: 5,
    name: 'SmartFleet',
    status: 'ACTIVE',
    plan: 'PREMIUM',
  };

  const documentItem: DocumentComplianceItem = {
    requirementId: 100,
    documentTypeId: 200,
    documentTypeCode: 'COMPANY_REGISTRATION',
    documentTypeLabel: 'Registre de commerce',
    required: true,
    expirationRequired: false,
    displayOrder: 1,
    complianceStatus: 'VALID',
    blocking: false,
    documentId: 300,
    documentTitle: 'Registre de commerce',
    activeVersionId: 401,
    currentVersionNumber: 1,
    issuedDate: null,
    expirationDate: null,
    daysUntilExpiration: null,
  };

  const archivedDocument: DocumentSummary = {
    documentId: 301,
    documentTypeId: 200,
    documentTypeLabel: 'Registre de commerce',
    ownerType: 'COMPANY',
    ownerId: 5,
    title: 'Ancien registre de commerce',
    status: 'ARCHIVED',
    activeVersionId: 402,
    currentVersionNumber: 1,
    documentNumber: null,
    issuedDate: null,
    expirationDate: null,
    originalFileName: 'registre.pdf',
    contentType: 'application/pdf',
    fileSize: 1024,
  };

  async function createPage() {
    const fixture = TestBed.createComponent(CompanyDocumentPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    vi.resetAllMocks();
    companyApiMock.findMyCompany.mockReturnValue(of(company));
    documentApiMock.findCompliance.mockReturnValue(of({
      ownerType: 'COMPANY', ownerId: 5, referenceDate: '2026-10-10',
      totalRequired: 1, compliantRequired: 1, missingRequired: 0,
      expiredRequired: 0, expiringSoon: 0, compliant: true, blocked: false,
      items: [documentItem],
    }));
    documentApiMock.findByOwner.mockReturnValue(of({
      content: [archivedDocument], page: 0, size: 10,
      totalElements: 1, totalPages: 1, last: true,
    }));

    await TestBed.configureTestingModule({
      imports: [CompanyDocumentPageComponent],
      providers: [
        provideRouter([]),
        { provide: CompanyApiService, useValue: companyApiMock },
        { provide: DocumentApiService, useValue: documentApiMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: NotificationService, useValue: notificationMock },
      ],
    }).compileComponents();
  });

  it('should load and display the authenticated company', async () => {
    companyApiMock.findMyCompany.mockReturnValue(of(company));

    const fixture = await createPage();

    expect(companyApiMock.findMyCompany).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.componentInstance.company()).toEqual(company);
    expect(fixture.nativeElement.textContent).toContain('SmartFleet');
    expect(fixture.nativeElement.textContent).toContain('ACTIVE');
    expect(fixture.nativeElement.textContent).toContain('PREMIUM');
    expect(documentApiMock.findCompliance).toHaveBeenCalledWith('COMPANY', 5);
    expect(documentApiMock.findByOwner).toHaveBeenCalledWith({
      ownerType: 'COMPANY', ownerId: 5, status: 'ARCHIVED', page: 0, size: 10,
    });
    expect(fixture.nativeElement.textContent).toContain('Conformité documentaire');
    expect(fixture.nativeElement.textContent).toContain('Documents archivés');
  });

  it('should display an error when the company cannot be loaded', async () => {
    companyApiMock.findMyCompany.mockReturnValue(throwError(() => new Error('API unavailable')));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      const fixture = await createPage();

      expect(companyApiMock.findMyCompany).toHaveBeenCalledOnce();
      expect(fixture.componentInstance.loading()).toBe(false);
      expect(fixture.componentInstance.company()).toBeNull();
      expect(fixture.componentInstance.error()).not.toBeNull();
      expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
      expect(fixture.nativeElement.textContent).toContain('Impossible de charger la société');
      expect(documentApiMock.findCompliance).not.toHaveBeenCalled();
      expect(documentApiMock.findByOwner).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  it('should add a company document and reload compliance', async () => {
    const fixture = await createPage();
    const compliance = fixture.debugElement.query(By.directive(OwnerDocumentComplianceComponent))
      .componentInstance as OwnerDocumentComplianceComponent;
    const reload = vi.spyOn(compliance, 'reload');
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) });
    const missingItem: DocumentComplianceItem = {
      ...documentItem, documentId: null, complianceStatus: 'MISSING',
    };

    fixture.componentInstance.addDocument(missingItem);

    expect(dialogMock.open).toHaveBeenCalledWith(CreateOwnerDocumentDialogComponent, expect.objectContaining({
      data: { ownerType: 'COMPANY', ownerId: 5, item: missingItem },
    }));
    expect(reload).toHaveBeenCalledOnce();
    expect(notificationMock.success).toHaveBeenCalledWith('Document ajouté avec succès.');
  });

  it('should replace a document version and reload compliance', async () => {
    const fixture = await createPage();
    const compliance = fixture.debugElement.query(By.directive(OwnerDocumentComplianceComponent))
      .componentInstance as OwnerDocumentComplianceComponent;
    const reload = vi.spyOn(compliance, 'reload');
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) });

    fixture.componentInstance.replaceDocument(documentItem);

    expect(dialogMock.open).toHaveBeenCalledWith(AddDocumentVersionDialogComponent, expect.objectContaining({
      data: { item: documentItem },
    }));
    expect(reload).toHaveBeenCalledOnce();
    expect(notificationMock.success).toHaveBeenCalledWith('Nouvelle version du document ajoutée avec succès.');
  });

  it('should reload compliance and archives after archiving a document', async () => {
    const fixture = await createPage();
    const compliance = fixture.debugElement.query(By.directive(OwnerDocumentComplianceComponent))
      .componentInstance as OwnerDocumentComplianceComponent;
    const archives = fixture.debugElement.query(By.directive(OwnerArchivedDocumentListComponent))
      .componentInstance as OwnerArchivedDocumentListComponent;
    const reloadCompliance = vi.spyOn(compliance, 'reload');
    const reloadArchives = vi.spyOn(archives, 'reload');
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) });

    fixture.componentInstance.viewDocument(documentItem);

    expect(dialogMock.open).toHaveBeenCalledWith(DocumentDetailDialogComponent, expect.objectContaining({
      data: { documentId: 300, documentTypeLabel: 'Registre de commerce' },
    }));
    expect(reloadCompliance).toHaveBeenCalledOnce();
    expect(reloadArchives).toHaveBeenCalledOnce();
    expect(notificationMock.success).toHaveBeenCalledWith('Document archivé avec succès.');
  });

  it('should open an archived company document without reloading', async () => {
    const fixture = await createPage();
    dialogMock.open.mockReturnValue({ afterClosed: () => of(false) });

    fixture.componentInstance.viewArchivedDocument(archivedDocument);

    expect(dialogMock.open).toHaveBeenCalledWith(DocumentDetailDialogComponent, expect.objectContaining({
      data: { documentId: 301, documentTypeLabel: 'Registre de commerce' },
    }));
    expect(documentApiMock.findCompliance).toHaveBeenCalledTimes(1);
    expect(documentApiMock.findByOwner).toHaveBeenCalledTimes(1);
  });
});

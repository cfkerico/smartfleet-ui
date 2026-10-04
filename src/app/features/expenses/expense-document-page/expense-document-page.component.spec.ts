import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { ExpenseApiService } from '../../../core/services/expense-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ExpenseDetailView } from '../../../models/expense.model';
import { DocumentComplianceItem, DocumentSummary } from '../../documents/models/document.model';
import { DocumentApiService } from '../../documents/services/document-api.service';
import { OwnerDocumentComplianceComponent } from '../../documents/components/owner-document-compliance/owner-document-compliance.component';
import { OwnerArchivedDocumentListComponent } from '../../documents/components/owner-archived-document-list/owner-archived-document-list.component';
import { CreateOwnerDocumentDialogComponent } from '../../documents/dialogs/create-owner-document-dialog/create-owner-document-dialog.component';
import { AddDocumentVersionDialogComponent } from '../../documents/dialogs/add-document-version-dialog/add-document-version-dialog.component';
import { DocumentDetailDialogComponent } from '../../documents/dialogs/document-detail-dialog/document-detail-dialog.component';
import { ExpenseDocumentPageComponent } from './expense-document-page.component';

describe('ExpenseDocumentPageComponent', () => {
  const routeId = { value: '5' };
  const expenseApiMock = { findExpenseDetail: vi.fn() };
  const documentApiMock = { findCompliance: vi.fn(), findByOwner: vi.fn() };
  const dialogMock = { open: vi.fn() };
  const notificationMock = { success: vi.fn(), error: vi.fn() };

  const expense: ExpenseDetailView = {
    request: {
      id: 5,
      vehicleId: 12,
      vehicleLabel: 'Toyota Yaris',
      expenseType: 'INSURANCE',
      description: 'Assurance',
      requestedAmount: 20000,
      priority: 'NORMAL',
      status: 'APPROVED',
      requestedBy: 'user-1',
      createdAt: new Date('2026-10-01T10:00:00Z'),
    },
    disbursements: [],
    totalPaid: 0,
    remainingAmount: 20000,
    fullyPaid: false,
    disbursementCount: 0,
    timeline: [],
  };

  const documentItem: DocumentComplianceItem = {
    requirementId: 100,
    documentTypeId: 200,
    documentTypeCode: 'EXPENSE_RECEIPT',
    documentTypeLabel: 'Justificatif de dépense',
    required: true,
    expirationRequired: false,
    displayOrder: 1,
    complianceStatus: 'VALID',
    blocking: false,
    documentId: 300,
    documentTitle: 'Justificatif de dépense',
    activeVersionId: 401,
    currentVersionNumber: 1,
    issuedDate: null,
    expirationDate: null,
    daysUntilExpiration: null,
  };

  async function createPage() {
    const fixture = TestBed.createComponent(ExpenseDocumentPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    vi.resetAllMocks();
    routeId.value = '5';
    expenseApiMock.findExpenseDetail.mockReturnValue(of(expense));
    documentApiMock.findCompliance.mockReturnValue(of({
      ownerType: 'EXPENSE', ownerId: 5, referenceDate: '2026-10-04',
      totalRequired: 1, compliantRequired: 1, missingRequired: 0,
      expiredRequired: 0, expiringSoon: 0, compliant: true, blocked: false,
      items: [documentItem],
    }));
    documentApiMock.findByOwner.mockReturnValue(of({
      content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, last: true,
    }));

    await TestBed.configureTestingModule({
      imports: [ExpenseDocumentPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (key: string) => key === 'id' ? routeId.value : null } } },
        },
        { provide: ExpenseApiService, useValue: expenseApiMock },
        { provide: DocumentApiService, useValue: documentApiMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: NotificationService, useValue: notificationMock },
      ],
    }).compileComponents();
  });

  it('loads the expense, compliance and archives', async () => {
    const fixture = await createPage();
    const component = fixture.componentInstance;

    expect(expenseApiMock.findExpenseDetail).toHaveBeenCalledWith(5);
    expect(component.expenseId()).toBe(5);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
    expect(documentApiMock.findCompliance).toHaveBeenCalledWith('EXPENSE', 5);
    expect(documentApiMock.findByOwner).toHaveBeenCalledWith({
      ownerType: 'EXPENSE', ownerId: 5, status: 'ARCHIVED', page: 0, size: 10,
    });
    expect(fixture.nativeElement.textContent).toContain('Toyota Yaris');
    expect(fixture.nativeElement.textContent).toContain('Conformité documentaire');
    expect(fixture.nativeElement.textContent).toContain('Documents archivés');
    expect(fixture.nativeElement.querySelector('a[href="/expenses/5?tab=documents"]')).not.toBeNull();
  });

  it('rejects an invalid expense id without requesting data', async () => {
    routeId.value = 'invalid';
    const fixture = await createPage();

    expect(expenseApiMock.findExpenseDetail).not.toHaveBeenCalled();
    expect(fixture.componentInstance.error()).toBe('Identifiant de la dépense invalide.');
    expect(fixture.nativeElement.textContent).toContain('Dépense indisponible');
    expect(documentApiMock.findCompliance).not.toHaveBeenCalled();
  });

  it('shows an error when loading the expense fails', async () => {
    expenseApiMock.findExpenseDetail.mockReturnValue(throwError(() => new Error('Network error')));
    const fixture = await createPage();

    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.componentInstance.error()).toBe('Impossible de charger les informations liées à la dépense.');
    expect(documentApiMock.findCompliance).not.toHaveBeenCalled();
    expect(documentApiMock.findByOwner).not.toHaveBeenCalled();
  });

  it('adds an expense document and reloads compliance', async () => {
    const fixture = await createPage();
    const compliance = fixture.debugElement.query(By.directive(OwnerDocumentComplianceComponent))
      .componentInstance as OwnerDocumentComplianceComponent;
    const reload = vi.spyOn(compliance, 'reload');
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) });

    const missingItem: DocumentComplianceItem = { ...documentItem, documentId: null, complianceStatus: 'MISSING' };
    fixture.componentInstance.addDocument(missingItem);

    expect(dialogMock.open).toHaveBeenCalledWith(CreateOwnerDocumentDialogComponent, expect.objectContaining({
      data: { ownerType: 'EXPENSE', ownerId: 5, item: missingItem },
    }));
    expect(reload).toHaveBeenCalledOnce();
    expect(notificationMock.success).toHaveBeenCalledWith('Document ajouté avec succès.');
  });

  it('replaces a version and reloads compliance', async () => {
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
  });

  it('reloads compliance and archives after archiving', async () => {
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
      data: { documentId: 300, documentTypeLabel: 'Justificatif de dépense' },
    }));
    expect(reloadCompliance).toHaveBeenCalledOnce();
    expect(reloadArchives).toHaveBeenCalledOnce();
    expect(notificationMock.success).toHaveBeenCalledWith('Document archivé avec succès.');
  });

  it('opens a document from the archive list', async () => {
    const fixture = await createPage();
    dialogMock.open.mockReturnValue({ afterClosed: () => of(false) });

    const archivedDocument: DocumentSummary = {
      documentId: 300,
      documentTypeId: 200,
      documentTypeLabel: 'Justificatif de dépense',
      ownerType: 'EXPENSE',
      ownerId: 5,
      title: 'Justificatif de dépense',
      status: 'ARCHIVED',
      activeVersionId: 401,
      currentVersionNumber: 1,
      documentNumber: null,
      issuedDate: null,
      expirationDate: null,
      originalFileName: 'justificatif.pdf',
      contentType: 'application/pdf',
      fileSize: 1024,
    };
    fixture.componentInstance.viewArchivedDocument(archivedDocument);

    expect(dialogMock.open).toHaveBeenCalledWith(DocumentDetailDialogComponent, expect.objectContaining({
      data: { documentId: 300, documentTypeLabel: 'Justificatif de dépense' },
    }));
  });
});

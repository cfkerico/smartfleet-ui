import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DocumentDetailDialogComponent, DocumentDetailDialogData } from './document-detail-dialog.component';
import { of } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { DocumentApiService } from '../../services/document-api.service';
import { ArchiveDocumentDialogComponent } from '../archive-document-dialog/archive-document-dialog.component';

describe('DocumentDetailDialogComponent', () => {
  let component: DocumentDetailDialogComponent;
  let fixture: ComponentFixture<DocumentDetailDialogComponent>;

  const documentApiMock = {
    findDetail: vi.fn(),
    findVersions: vi.fn(),
    downloadVersion: vi.fn()
  };

  const dialogRefMock = {
    close: vi.fn()
  };

  const notificationMock = {
    error: vi.fn()
  };

  const dialogData: DocumentDetailDialogData = {
    documentId: 300,
    documentTypeLabel: 'Assurance automobile'
  };

  const archiveDialogRefMock = {
    afterClosed: vi.fn()
  };

  const matDialogMock = {
    open: vi.fn()
  };

  beforeEach(async () => {
    documentApiMock.findDetail.mockReturnValue(of({
      documentId: 300,
      documentTypeId: 200,
      documentTypeCode: 'VEHICLE_INSURANCE',
      documentTypeLabel: 'Assurance automobile',
      documentTypeDescription: `Police d'assurance`,
      ownerType: 'VEHICLE',
      ownerId: 10,
      title: 'Assurance automobile 2027',
      status: 'VALID',
      activeVersionId: 401,
      currentVersionNumber: 2,
      documentNumber: 'POL-2027-001',
      issuedDate: '2027-08-01',
      expirationDate: '2028-08-01',
      comment: 'Renouvellement annuel',
      originalFileName: 'assurance-2027.pdf',
      contentType: 'application/pdf',
      fileSize: 2048,
      archivedBy: null,
      archivedAt: null,
      archiveReason: null,
      createdBy: 'user-1',
      createdAt: '2026-08-01T10:00:00Z',
      updatedBy: 'user-2',
      updatedAt: '2026-08-01T10:00:00Z'
    }));

    documentApiMock.findVersions.mockReturnValue(of([
      {
        versionId: 401,
        documentId: 300,
        versionNumber: 2,
        active: true,
        documentNumber: 'POL-2027-001',
        issuedDate: '2027-08-01',
        expirationDate: '2028-08-01',
        comment: 'Renouvellement annuel',
        originalFileName: 'assurance-2027.pdf',
        contentType: 'application/pdf',
        fileSize: 2048,
        createdBy: 'user-2',
        createdAt: '2027-08-01T10:00:00Z'
      },
      {
        versionId: 400,
        documentId: 300,
        versionNumber: 1,
        active: false,
        documentNumber: 'POL-2026-001',
        issuedDate: '2026-08-01',
        expirationDate: '2027-08-01',
        comment: 'Dépôt initial',
        originalFileName: 'assurance-2026.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
        createdBy: 'user-1',
        createdAt: '2026-08-01T10:00:00Z'
      }
    ]));

    archiveDialogRefMock.afterClosed.mockReturnValue(of(true));
    matDialogMock.open.mockReturnValue(archiveDialogRefMock);

    await TestBed.configureTestingModule({
      imports: [DocumentDetailDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData
        },
        {
          provide: MatDialogRef,
          useValue: dialogRefMock
        },
        {
          provide: NotificationService,
          useValue: notificationMock
        },
        {
          provide: DocumentApiService,
          useValue: documentApiMock
        }
      ]
    }).overrideComponent(DocumentDetailDialogComponent, {
      add: {
        providers: [
          {
            provide: MatDialog,
            useValue: matDialogMock
          }
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should load the detail and version history', () => {
    expect(documentApiMock.findDetail).toHaveBeenCalledWith(300);

    expect(documentApiMock.findVersions).toHaveBeenCalledWith(300);

    expect(component.detail()?.documentId).toBe(300);
    expect(component.versions()).toHaveLength(2);
    expect(component.versions()[0].active).toBe(true);
    expect(component.loading()).toBe(false);

    const content = fixture.nativeElement.textContent as string;

    expect(content).toContain('Assurance automobile 2027');

    expect(content).toContain('Version 2');

    expect(content).toContain('Version 1');
  });

  it('should open the archive dialog and propagate a successful archival', () => {
    component.archiveDocument();

    expect(matDialogMock.open).toHaveBeenCalledWith(
      ArchiveDocumentDialogComponent,
      expect.objectContaining({
        width: '520px',
        maxWidth: '95vw',
        disableClose: true,
        data: {
          documentId: 300,
          documentTypeLabel: 'Assurance automobile'
        }
      })
    );

    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });
  
  it('should not open the archive dialog for an archived document', () => {
    const documentDetail = component.detail();

    if (documentDetail === null) {
      throw new Error('The document detail should have been loaded');
    }

    component.detail.set({
      ...documentDetail,
      status: 'ARCHIVED'
    });

    component.archiveDocument();

    expect(matDialogMock.open).not.toHaveBeenCalled();
  });


  it('should display archival information for an archived document', () => {
    const documentDetail = component.detail();

    if (documentDetail === null) {
      throw new Error('The document detail should have been loaded');
    }

    component.detail.set({
      ...documentDetail,
      status: 'ARCHIVED',
      archivedBy: 'user-1',
      archivedAt: '2026-08-23T10:00:00Z',
      archiveReason: 'Document remplacé'
    });

    fixture.detectChanges();

    const content = fixture.nativeElement.textContent as string;
    const archiveButton =
      fixture.nativeElement.querySelector('.archive-action');

    expect(content).toContain(`Informations d'archivage`);
    expect(content).toContain('user-1');
    expect(content).toContain('Document remplacé');
    expect(archiveButton).toBeNull();
  });




});

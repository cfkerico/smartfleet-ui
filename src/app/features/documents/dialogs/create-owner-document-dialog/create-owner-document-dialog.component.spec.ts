import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { of } from 'rxjs';

import { DocumentApiService } from '../../services/document-api.service';
import { CreateOwnerDocumentDialogComponent, CreateOwnerDocumentDialogData } from './create-owner-document-dialog.component';

describe('CreateOwnerDocumentDialogComponent', () => {
  let component: CreateOwnerDocumentDialogComponent;
  let fixture: ComponentFixture<CreateOwnerDocumentDialogComponent>;

  const documentApiMock = {
    uploadDocument: vi.fn(),
  };

  const dialogRefMock = {
    close: vi.fn(),
  };

  const dialogData: CreateOwnerDocumentDialogData = {
    ownerType: 'VEHICLE',
    ownerId: 10,
    item: {
      requirementId: 100,
      documentTypeId: 200,
      documentTypeCode: 'VEHICLE_INSURANCE',
      documentTypeLabel: 'Assurance automobile',

      required: true,
      expirationRequired: true,
      displayOrder: 1,

      complianceStatus: 'MISSING',
      blocking: true,

      documentId: null,
      documentTitle: null,
      activeVersionId: null,
      currentVersionNumber: null,
      issuedDate: null,
      expirationDate: null,
      daysUntilExpiration: null
    }
  };

  beforeEach(async () => {
    documentApiMock.uploadDocument.mockReturnValue(of({
      documentId: 300,
      documentVersionId: 400,
      documentTypeId: 200,
      ownerType: 'VEHICLE',
      ownerId: 10,
      title: 'Assurance automobile',
      status: 'VALID',
      versionNumber: 1,
      documentNumber: 'POL-2026-001',
      issuedDate: '2026-08-01',
      expirationDate: '2027-08-01',
      originalFileName: 'assurance.pdf',
      contentType: 'application/pdf',
      fileSize: 1024
    }));

    await TestBed.configureTestingModule({
      imports: [CreateOwnerDocumentDialogComponent],
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
          provide: DocumentApiService,
          useValue: documentApiMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOwnerDocumentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    //await fixture.whenStable();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should upload the document and close with success', () => {
    const file = new File(
      ['pdf-content'],
      'assurance.pdf',
      { type: 'application/pdf' }
    );

    component.form.patchValue({
      title: 'Assurance automobile',
      documentNumber: 'POL-2026-001',
      issuedDate: '2026-08-01',
      expirationDate: '2027-08-01',
      comment: 'Dépôt initial',
      file
    });

    component.submit();

    expect(documentApiMock.uploadDocument)
      .toHaveBeenCalledWith({
        documentTypeId: 200,
        ownerType: 'VEHICLE',
        ownerId: 10,
        title: 'Assurance automobile',
        documentNumber: 'POL-2026-001',
        issuedDate: '2026-08-01',
        expirationDate: '2027-08-01',
        comment: 'Dépôt initial'
      },
      file
    );

    expect(dialogRefMock.close).toHaveBeenCalledWith(true);

    expect(component.submitting()).toBe(false);
  });

  it('should require an expiration date for a missing document when configured', () => {
    const file = new File(
      ['pdf-content'],
      'assurance.pdf',
      { type: 'application/pdf' }
    );

    // Le document est manquant : item.expirationDate vaut null,
    // mais le type exige une date d'expiration.
    expect(dialogData.item.documentId).toBeNull();
    expect(dialogData.item.expirationDate).toBeNull();
    expect(dialogData.item.expirationRequired).toBe(true);

    component.form.patchValue({ file });
    component.submit();

    expect(component.form.controls.expirationDate.hasError('required'))
      .toBe(true);
    expect(documentApiMock.uploadDocument).not.toHaveBeenCalled();
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

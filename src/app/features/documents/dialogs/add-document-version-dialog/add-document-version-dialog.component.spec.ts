import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { of } from 'rxjs';

import { DocumentApiService } from '../../services/document-api.service';
import { AddDocumentVersionDialogComponent, AddDocumentVersionDialogData } from './add-document-version-dialog.component';

describe('AddDocumentVersionDialogComponent', () => {
  let component: AddDocumentVersionDialogComponent;
  let fixture: ComponentFixture<AddDocumentVersionDialogComponent>;

  const documentApiMock = {
    addVersion: vi.fn()
  };
  const dialogRefMock = {
    close: vi.fn()
  }

  const dialogData: AddDocumentVersionDialogData = {
    item: {
      requirementId: 100,
      documentTypeId: 200,
      documentTypeCode: 'VEHICLE_INSURANCE',
      documentTypeLabel: 'Assurance automobile',

      required: true,
      expirationRequired: true,
      displayOrder: 1,

      complianceStatus: 'EXPIRING_SOON',
      blocking: false,

      documentId: 300,
      documentTitle: 'Assurance automobile 2026',
      activeVersionId: 400,
      currentVersionNumber: 1,
      issuedDate: '2026-08-01',
      expirationDate: '2027-08-01',
      daysUntilExpiration: 10
    }
  };

  beforeEach(async () => {
    documentApiMock.addVersion.mockReturnValue(of({
      documentId: 300,
      documentVersionId: 401,
      status: 'VALID',
      versionNumber: 2,
      documentNumber: 'POL-2027-001',
      issuedDate: '2027-08-01',
      expirationDate: '2028-08-01',
      originalFileName: 'assurance-2027.pdf',
      contentType: 'application/pdf',
      fileSize: 2048
    }));

    await TestBed.configureTestingModule({
      imports: [AddDocumentVersionDialogComponent],
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

    fixture = TestBed.createComponent(AddDocumentVersionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should add a version and close with success', () => {
    const file = new File(
      ['new-pdf-content'],
      'assurance-2027.pdf',
      { type: 'application/pdf' }
    );

    component.form.patchValue({
      documentNumber: 'POL-2027-001',
      issuedDate: '2027-08-01',
      expirationDate: '2028-08-01',
      comment: 'Renouvellement annuel',
      file
    });

    component.submit();

    expect(documentApiMock.addVersion)
      .toHaveBeenCalledWith(
        300,
        {
          documentNumber: 'POL-2027-001',
          issuedDate: '2027-08-01',
          expirationDate: '2028-08-01',
          comment: 'Renouvellement annuel'
        },
        file
      );

      expect(dialogRefMock.close).toHaveBeenCalledWith(true);

      expect(component.submitting()).toBe(false);
  });
});

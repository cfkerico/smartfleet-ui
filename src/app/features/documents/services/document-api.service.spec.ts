import {
  provideHttpClient,
} from '@angular/common/http';

import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { TestBed } from '@angular/core/testing';

import { API_ENDPOINTS } from '../../../core/config/api-endpoints';
import {
  CreateDocumentMetadata,
  CreateDocumentResponse,
  OwnerDocumentCompliance,
} from '../models/document.model';
import { DocumentApiService } from './document-api.service';

describe('DocumentApiService', () => {
  let service: DocumentApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DocumentApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(DocumentApiService);

    httpTestingController =
      TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should upload a document as multipart form data', () => {
    const metadata: CreateDocumentMetadata = {
      documentTypeId: 1,
      ownerType: 'VEHICLE',
      ownerId: 10,
      title: 'Vehicle insurance',
      documentNumber: 'POL-2026-001',
      issuedDate: '2026-07-20',
      expirationDate: '2027-07-20',
      comment: 'Initial version',
    };

    const file = new File(
      ['pdf-content'],
      'insurance.pdf',
      { type: 'application/pdf' }
    );

    const response: CreateDocumentResponse = {
      documentId: 100,
      documentVersionId: 200,
      documentTypeId: 1,
      ownerType: 'VEHICLE',
      ownerId: 10,
      title: 'Vehicle insurance',
      status: 'VALID',
      versionNumber: 1,
      documentNumber: 'POL-2026-001',
      issuedDate: '2026-07-20',
      expirationDate: '2027-07-20',
      originalFileName: 'insurance.pdf',
      contentType: 'application/pdf',
      fileSize: 11,
    };

    service.uploadDocument(metadata, file).subscribe(result => {
      expect(result).toEqual(response);
    });

    const request =
      httpTestingController.expectOne(API_ENDPOINTS.documents);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);

    const formData = request.request.body as FormData;

    expect(formData.get('file')).toBe(file);

    const metadataPart = formData.get('metadata');

    expect(metadataPart).toBeInstanceOf(Blob);
    expect((metadataPart as Blob).type)
      .toBe('application/json');

    request.flush(response);
  });

  it('should find documents by owner with pagination and status', () => {
    service.findByOwner({
      ownerType: 'VEHICLE',
      ownerId: 10,
      status: 'VALID',
      page: 1,
      size: 20,
    }).subscribe(result => {
      expect(result.page).toBe(1);
      expect(result.totalElements).toBe(1);
      expect(result.content[0].documentId).toBe(100);
    });

    const request = httpTestingController.expectOne(candidate =>
      candidate.url === API_ENDPOINTS.documents
      && candidate.params.get('ownerType') === 'VEHICLE'
      && candidate.params.get('ownerId') === '10'
      && candidate.params.get('status') === 'VALID'
      && candidate.params.get('page') === '1'
      && candidate.params.get('size') === '20'
    );

    expect(request.request.method).toBe('GET');

    request.flush({
      content: [
        {
          documentId: 100,
          documentTypeId: 1,
          documentTypeLabel: 'Insurance',
          ownerType: 'VEHICLE',
          ownerId: 10,
          title: 'Vehicle insurance',
          status: 'VALID',
          activeVersionId: 200,
          currentVersionNumber: 1,
          documentNumber: 'POL-2026-001',
          issuedDate: '2026-07-20',
          expirationDate: '2027-07-20',
          originalFileName: 'insurance.pdf',
          contentType: 'application/pdf',
          fileSize: 11,
        },
      ],
      page: 1,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      last: true,
    });
  });

  it('should find document detail', () => {
    service.findDetail(100).subscribe(result => {
      expect(result.documentId).toBe(100);
      expect(result.status).toBe('VALID');
      expect(result.activeVersionId).toBe(200);
    });

    const request = httpTestingController.expectOne(
      `${API_ENDPOINTS.documents}/100`
    );

    expect(request.request.method).toBe('GET');

    request.flush({
      documentId: 100,
      documentTypeId: 1,
      documentTypeCode: 'VEHICLE_INSURANCE',
      documentTypeLabel: 'Vehicle insurance',
      documentTypeDescription: 'Insurance certificate',
      ownerType: 'VEHICLE',
      ownerId: 10,
      title: 'Vehicle insurance 2026',
      status: 'VALID',
      activeVersionId: 200,
      currentVersionNumber: 1,
      documentNumber: 'POL-2026-001',
      issuedDate: '2026-07-20',
      expirationDate: '2027-07-20',
      comment: 'Initial version',
      originalFileName: 'insurance.pdf',
      contentType: 'application/pdf',
      fileSize: 1024,
      archivedBy: null,
      archivedAt: null,
      archiveReason: null,
      createdBy: 'user-1',
      createdAt: '2026-07-20T10:00:00Z',
      updatedBy: null,
      updatedAt: null,
    });
  });

  it('should find all document versions', () => {
    service.findVersions(100).subscribe(result => {
      expect(result).toHaveLength(2);
      expect(result[0].versionNumber).toBe(2);
      expect(result[0].active).toBe(true);
      expect(result[1].active).toBe(false);
    });

    const request = httpTestingController.expectOne(
      `${API_ENDPOINTS.documents}/100/versions`
    );

    expect(request.request.method).toBe('GET');

    request.flush([
      {
        versionId: 201,
        documentId: 100,
        versionNumber: 2,
        active: true,
        documentNumber: 'POL-2027-001',
        issuedDate: '2027-07-20',
        expirationDate: '2028-07-20',
        comment: 'Renewal',
        originalFileName: 'insurance-2027.pdf',
        contentType: 'application/pdf',
        fileSize: 2048,
        createdBy: 'user-2',
        createdAt: '2027-07-20T10:00:00Z',
      },
      {
        versionId: 200,
        documentId: 100,
        versionNumber: 1,
        active: false,
        documentNumber: 'POL-2026-001',
        issuedDate: '2026-07-20',
        expirationDate: '2027-07-20',
        comment: 'Initial version',
        originalFileName: 'insurance-2026.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
        createdBy: 'user-1',
        createdAt: '2026-07-20T10:00:00Z',
      },
    ]);
  });

  it('should archive a document', () => {
    service.archive(100, {
      reason: 'Document replaced',
    }).subscribe(result => {
      expect(result.documentId).toBe(100);
      expect(result.status).toBe('ARCHIVED');
      expect(result.archiveReason)
        .toBe('Document replaced');
    });

    const request = httpTestingController.expectOne(
      `${API_ENDPOINTS.documents}/100/archive`
    );

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      reason: 'Document replaced',
    });

    request.flush({
      documentId: 100,
      status: 'ARCHIVED',
      archivedBy: 'user-2',
      archivedAt: '2026-08-14T10:00:00Z',
      archiveReason: 'Document replaced',
    });
  });

  it('should add a document version as multipart form data', () => {
    const metadata = {
      documentNumber: 'POL-2027-001',
      issuedDate: '2027-07-20',
      expirationDate: '2028-07-20',
      comment: 'Annual renewal',
    };

    const file = new File(
      ['new-pdf-content'],
      'insurance-2027.pdf',
      { type: 'application/pdf' }
    );

    service.addVersion(100, metadata, file)
      .subscribe(result => {
        expect(result.documentId).toBe(100);
        expect(result.documentVersionId).toBe(201);
        expect(result.versionNumber).toBe(2);
        expect(result.status).toBe('VALID');
      });

    const request = httpTestingController.expectOne(
      `${API_ENDPOINTS.documents}/100/versions`
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);

    const formData = request.request.body as FormData;

    expect(formData.get('file')).toBe(file);

    const metadataPart = formData.get('metadata');

    expect(metadataPart).toBeInstanceOf(Blob);
    expect((metadataPart as Blob).type)
      .toBe('application/json');

    request.flush({
      documentId: 100,
      documentVersionId: 201,
      status: 'VALID',
      versionNumber: 2,
      documentNumber: 'POL-2027-001',
      issuedDate: '2027-07-20',
      expirationDate: '2028-07-20',
      originalFileName: 'insurance-2027.pdf',
      contentType: 'application/pdf',
      fileSize: 15,
    });
  });


  it('should download a document version with response headers', () => {
    const fileContent = new Blob(
      ['pdf-content'],
      { type: 'application/pdf' }
    );

    service.downloadVersion(100, 201)
      .subscribe(response => {
        expect(response.body).toEqual(fileContent);

        expect(response.headers.get('Content-Type'))
          .toBe('application/pdf');

        expect(response.headers.get('Content-Disposition'))
          .toContain('insurance-2027.pdf');
      });

    const request = httpTestingController.expectOne(
      `${API_ENDPOINTS.documents}/100/versions/201/file`
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');

    request.flush(fileContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="insurance-2027.pdf"',
      },
    });
  });

  it('should find documment compliance by owner', () => {
    const response: OwnerDocumentCompliance = {
      ownerType: 'VEHICLE',
      ownerId: 10,
      referenceDate: '2026-08-18',

      totalRequired: 2,
      compliantRequired: 1,
      missingRequired: 1,
      expiredRequired: 0,
      expiringSoon: 1,

      compliant: false,
      blocked: true,

      items: [
        {
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
          documentTitle: 'Assurance 2026',
          activeVersionId: 400,
          currentVersionNumber: 1,
          issuedDate: '2026-01-01',
          expirationDate: '2026-08-28',
          daysUntilExpiration: 10,
        },
        {
          requirementId: 101,
          documentTypeId: 201,
          documentTypeCode: 'TECHNICAL_TEST',
          documentTypeLabel: 'Contrôle technique',
          
          required: true,
          expirationRequired: true,
          displayOrder: 2,

          complianceStatus: 'MISSING',
          blocking: true,

          documentId: null,
          documentTitle: null,
          activeVersionId: null,
          currentVersionNumber: null,
          issuedDate: null,
          expirationDate: null,
          daysUntilExpiration: null,
        },
      ],
    };

    service.findCompliance('VEHICLE', 10)
      .subscribe(result => {
        expect(result).toEqual(response);
        expect(result.items).toHaveLength(2);
        expect(result.items[1].complianceStatus)
          .toBe('MISSING');
      });

    const request = httpTestingController.expectOne(candidate =>
      candidate.url === `${API_ENDPOINTS.documents}/compliance`
      && candidate.params.get('ownerType') === 'VEHICLE'
      && candidate.params.get('ownerId') === '10'
    );

    expect(request.request.method).toBe('GET');

    request.flush(response);
  });

});
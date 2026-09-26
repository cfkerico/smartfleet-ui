import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DocumentSummary } from '../../models/document.model';
import { DocumentApiService } from '../../services/document-api.service';
import { OwnerArchivedDocumentListComponent } from './owner-archived-document-list.component';

describe('OwnerArchivedDocumentListComponent', () => {
  let component: OwnerArchivedDocumentListComponent;
  let fixture: ComponentFixture<OwnerArchivedDocumentListComponent>;

  const archivedDocument: DocumentSummary = {
    documentId: 300,
    documentTypeId: 200,
    documentTypeLabel: 'Assurance automobile',
    ownerType: 'VEHICLE',
    ownerId: 10,
    title: 'Assurance automobile 2027',
    status: 'ARCHIVED',
    activeVersionId: 401,
    currentVersionNumber: 2,
    documentNumber: 'POL-2027-001',
    issuedDate: '2027-08-01',
    expirationDate: '2028-08-01',
    originalFileName: 'assurance-2027.pdf',
    contentType: 'application/pdf',
    fileSize: 2048
  };

  const documentApiMock = {
    findByOwner: vi.fn()
  };

  beforeEach(async () => {
    documentApiMock.findByOwner.mockReturnValue(of({
      content: [archivedDocument],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      last: true
    }));

    await TestBed.configureTestingModule({
      imports: [OwnerArchivedDocumentListComponent],
      providers: [
        {
          provide: DocumentApiService,
          useValue: documentApiMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(
      OwnerArchivedDocumentListComponent
    );

    fixture.componentRef.setInput('ownerType', 'VEHICLE');
    fixture.componentRef.setInput('ownerId', 10);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should load archived documents for the owner', () => {
    expect(documentApiMock.findByOwner).toHaveBeenCalledWith({
      ownerType: 'VEHICLE',
      ownerId: 10,
      status: 'ARCHIVED',
      page: 0,
      size: 10
    });

    expect(component.documents()).toEqual([archivedDocument]);
    expect(component.totalElements()).toBe(1);
    expect(component.loading()).toBe(false);

    const content = fixture.nativeElement.textContent as string;

    expect(content).toContain('Assurance automobile 2027');
    expect(content).toContain('Archivé');
  });

  it('should load the selected page', () => {
    component.onPageChange({
      pageIndex: 1,
      pageSize: 5,
      length: 12,
      previousPageIndex: 0
    });

    expect(documentApiMock.findByOwner).toHaveBeenLastCalledWith({
      ownerType: 'VEHICLE',
      ownerId: 10,
      status: 'ARCHIVED',
      page: 1,
      size: 5
    });
  });

  it('should emit the selected document', () => {
    const viewSpy = vi.fn();

    component.viewRequested.subscribe(viewSpy);

    component.view(archivedDocument);

    expect(viewSpy).toHaveBeenCalledWith(archivedDocument);
  });
});
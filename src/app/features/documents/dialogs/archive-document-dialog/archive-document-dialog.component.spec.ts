import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import {
  ArchiveDocumentDialogComponent,
  ArchiveDocumentDialogData
} from './archive-document-dialog.component';
import { DocumentApiService } from '../../services/document-api.service';

describe('ArchiveDocumentDialogComponent', () => {
  let component: ArchiveDocumentDialogComponent;
  let fixture: ComponentFixture<ArchiveDocumentDialogComponent>;

  const documentApiMock = {
    archive: vi.fn()
  };

  const dialogRefMock = {
    close: vi.fn()
  };

  const dialogData: ArchiveDocumentDialogData = {
    documentId: 300,
    documentTypeLabel: 'Assurance automobile'
  };

  beforeEach(async () => {
    documentApiMock.archive.mockReturnValue(of({
      documentId: 300,
      status: 'ARCHIVED',
      archivedBy: 'user-1',
      archivedAt: '2026-08-23T10:00:00Z',
      archiveReason: 'Document remplacé'
    }));

    await TestBed.configureTestingModule({
      imports: [ArchiveDocumentDialogComponent],
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

    fixture = TestBed.createComponent(ArchiveDocumentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should archive the document and close the dialog', () => {
    component.form.controls.reason.setValue('  Document remplacé  ');

    component.submit();

    expect(documentApiMock.archive).toHaveBeenCalledWith(
      300,
      { reason: 'Document remplacé' }
    );

    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    expect(component.submitting()).toBe(false);
  });

  it('should reject a reason containing only spaces', () => {
    component.form.controls.reason.setValue('   ');

    component.submit();

    expect(component.form.controls.reason.hasError('required')).toBe(true);
    expect(documentApiMock.archive).not.toHaveBeenCalled();
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });

  it('should close without archiving when cancelled', () => {
    component.cancel();

    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
    expect(documentApiMock.archive).not.toHaveBeenCalled();
  });
});
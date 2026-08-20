import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { DocumentAdministrationApiService } from '../../services/document-administration-api.service';

import { DocumentRequirementFormDialogComponent } from './document-requirement-form-dialog.component';

describe('DocumentRequirementFormDialogComponent', () => {
  let component: DocumentRequirementFormDialogComponent;
  let fixture: ComponentFixture<DocumentRequirementFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentRequirementFormDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mode: 'CREATE', ownerType: 'VEHICLE', configuredDocumentTypeIds: [],
          },
        },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        {
          provide: DocumentAdministrationApiService,
          useValue: {
            findDocumentTypes: () => of([]),
            configureDocumentRequirement: () => of(null),
            updateDocumentRequirement: () => of(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentRequirementFormDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

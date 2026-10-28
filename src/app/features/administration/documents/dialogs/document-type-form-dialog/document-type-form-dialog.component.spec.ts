import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { DocumentAdministrationApiService } from '../../services/document-administration-api.service';

import { DocumentTypeFormDialogComponent } from './document-type-form-dialog.component';

describe('DocumentTypeFormDialogComponent', () => {
  let component: DocumentTypeFormDialogComponent;
  let fixture: ComponentFixture<DocumentTypeFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentTypeFormDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'CREATE', ownerType: 'VEHICLE' } },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        {
          provide: DocumentAdministrationApiService,
          useValue: { createDocumentType: () => of(null), updateDocumentType: () => of(null) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentTypeFormDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the harmonized form and require its identification fields', () => {
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Identification');
    expect(text).toContain('Informations complémentaires');
    expect(text).toContain('Créer le type');
    expect((fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).disabled)
      .toBe(true);
  });
});

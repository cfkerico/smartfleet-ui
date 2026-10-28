import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DocumentAdministrationApiService } from '../../services/document-administration-api.service';

import { DocumentTypeFormDialogComponent } from './document-type-form-dialog.component';

describe('DocumentTypeFormDialogComponent', () => {
  let component: DocumentTypeFormDialogComponent;
  let fixture: ComponentFixture<DocumentTypeFormDialogComponent>;
  const notification = { success: vi.fn(), error: vi.fn() };
  const api = {
    createDocumentType: vi.fn(() => of(null)),
    updateDocumentType: vi.fn(() => of(null)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DocumentTypeFormDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'CREATE', ownerType: 'VEHICLE' } },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: DocumentAdministrationApiService, useValue: api },
        { provide: NotificationService, useValue: notification },
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

  it('should allow a document type for a treasury deposit', () => {
    expect(component.ownerTypes).toContain('TREASURY_DEPOSIT');
    component.form.controls.applicableOwnerType.setValue('TREASURY_DEPOSIT');
    expect(component.form.controls.applicableOwnerType.value).toBe('TREASURY_DEPOSIT');
  });

  it('should notify when creation fails without closing the dialog', () => {
    api.createDocumentType.mockImplementationOnce(() => throwError(() => new Error('Network')));
    component.form.patchValue({ code: 'PROOF', label: 'Justificatif', applicableOwnerType: 'TREASURY_DEPOSIT' });
    component.submit();
    expect(notification.error).toHaveBeenCalledWith('Impossible de créer le type de document.');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DocumentAdministrationApiService } from '../../services/document-administration-api.service';
import { DocumentTypeView } from '../../models/document-admin.model';

import { DocumentTypeListComponent } from './document-type-list.component';

describe('DocumentTypeListComponent', () => {
  let component: DocumentTypeListComponent;
  let fixture: ComponentFixture<DocumentTypeListComponent>;
  const dialog = { open: vi.fn() };
  const notification = { success: vi.fn(), error: vi.fn() };
  const api = { findDocumentTypes: vi.fn(() => of([])) };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DocumentTypeListComponent],
      providers: [
        { provide: DocumentAdministrationApiService, useValue: api },
        { provide: MatDialog, useValue: dialog },
        { provide: NotificationService, useValue: notification },
      ],
    }).overrideComponent(DocumentTypeListComponent, {
      add: { providers: [{ provide: MatDialog, useValue: dialog }] },
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentTypeListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should offer treasury deposits in the owner filter', () => {
    expect(component.ownerTypes).toContain('TREASURY_DEPOSIT');
  });

  it('should notify after creating or updating a document type', () => {
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    component.openCreateDialog();
    expect(notification.success).toHaveBeenCalledWith('Type de document créé avec succès.');

    const documentType: DocumentTypeView = {
      id: 1, code: 'PROOF', label: 'Justificatif', applicableOwnerType: 'TREASURY_DEPOSIT',
      active: true, systemType: false, createdAt: '2026-10-28T00:00:00Z'
    };
    component.openEditDialog(documentType);
    expect(notification.success).toHaveBeenCalledWith('Type de document mis à jour.');
    expect(api.findDocumentTypes).toHaveBeenCalledTimes(3);
  });
});

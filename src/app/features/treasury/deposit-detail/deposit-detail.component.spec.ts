import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { DepositApiService } from '../deposit-api.service';
import { DepositDetailComponent } from './deposit-detail.component';
import { DocumentDetailDialogComponent } from '../../documents/dialogs/document-detail-dialog/document-detail-dialog.component';
import { CreateOwnerDocumentDialogComponent } from '../../documents/dialogs/create-owner-document-dialog/create-owner-document-dialog.component';
import { ConfirmationDialogComponent } from '../../../shared/confirmation/confirmation-dialog.component';
import { DocumentApiService } from '../../documents/services/document-api.service';
import { DocumentAdministrationApiService } from '../../administration/documents/services/document-administration-api.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('DepositDetailComponent', () => {
  const api = { findById: vi.fn(), confirm: vi.fn() };
  const dialog = { open: vi.fn() };
  const documents = { findByOwner: vi.fn() };
  const documentAdmin = { findDocumentTypes: vi.fn() };
  const notification = { success: vi.fn(), error: vi.fn() };
  const auth = { isAdmin: vi.fn(() => false), hasRole: vi.fn((role: string) => role === 'TREASURER') };
  const confirmedDeposit = {
    id: 3, companyId: 1, targetAccountId: 2, amount: 40000,
    operationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', status: 'CONFIRMED',
    allocations: [{ paymentId: 11, amount: 40000 }], proofDocumentId: 9,
    createdBy: 'treasurer', createdAt: '2026-10-28T10:00:00Z',
    confirmedBy: 'treasurer', confirmedAt: '2026-10-28T11:00:00Z',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    auth.hasRole.mockImplementation((role: string) => role === 'TREASURER');
    auth.isAdmin.mockReturnValue(false);
    api.findById.mockReturnValue(of(confirmedDeposit));
    api.confirm.mockReturnValue(of(confirmedDeposit));
    documents.findByOwner.mockReturnValue(of({ content: [{ documentId: 9, title: 'Reçu', status: 'VALID' }],
      page: 0, size: 100, totalElements: 1, totalPages: 1, last: true }));
    documentAdmin.findDocumentTypes.mockReturnValue(of([{ id: 4, code: 'DEPOSIT_PROOF', label: 'Reçu', active: true }]));
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    await TestBed.configureTestingModule({
      imports: [DepositDetailComponent],
      providers: [provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ depositId: '3' }) } } },
        { provide: DepositApiService, useValue: api },
        { provide: AuthService, useValue: auth },
        { provide: DocumentApiService, useValue: documents },
        { provide: DocumentAdministrationApiService, useValue: documentAdmin },
        { provide: NotificationService, useValue: notification },
        { provide: MatDialog, useValue: dialog }],
    }).overrideComponent(DepositDetailComponent, {
      add: { providers: [{ provide: MatDialog, useValue: dialog }] },
    }).compileComponents();
  });

  it('shows the allocations and opens the proof document', async () => {
    const fixture = TestBed.createComponent(DepositDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(api.findById).toHaveBeenCalledWith(3);
    expect(fixture.nativeElement.textContent).toContain('Versement #11');
    expect(fixture.nativeElement.textContent).toContain('Document #9');
    fixture.componentInstance.viewProof();
    expect(dialog.open).toHaveBeenCalledWith(DocumentDetailDialogComponent,
      expect.objectContaining({ data: { documentId: 9, documentTypeLabel: 'Justificatif de dépôt', readOnly: true } }));
  });

  it('loads valid proofs and opens the upload dialog for a preparing deposit', () => {
    api.findById.mockReturnValue(of({ ...confirmedDeposit, status: 'PREPARING', proofDocumentId: null,
      confirmedBy: null, confirmedAt: null }));
    const fixture = TestBed.createComponent(DepositDetailComponent);
    fixture.detectChanges();

    expect(documents.findByOwner).toHaveBeenCalledWith({ ownerType: 'TREASURY_DEPOSIT',
      ownerId: 3, status: 'VALID', page: 0, size: 100 });
    expect(fixture.componentInstance.selectedProofId.value).toBe(9);

    fixture.componentInstance.uploadProof();
    expect(dialog.open).toHaveBeenCalledWith(CreateOwnerDocumentDialogComponent,
      expect.objectContaining({ data: expect.objectContaining({
        ownerType: 'TREASURY_DEPOSIT', ownerId: 3,
        item: expect.objectContaining({ documentTypeId: 4 }),
      }) }));
    expect(notification.success).toHaveBeenCalledWith('Justificatif ajouté au dépôt.');
  });

  it('asks for confirmation and confirms only with a valid selected proof', () => {
    api.findById.mockReturnValue(of({ ...confirmedDeposit, status: 'PREPARING', proofDocumentId: null,
      confirmedBy: null, confirmedAt: null }));
    const fixture = TestBed.createComponent(DepositDetailComponent);
    fixture.detectChanges();
    fixture.componentInstance.confirmDeposit();

    expect(dialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent,
      expect.objectContaining({ data: expect.objectContaining({ confirmLabel: 'Confirmer le dépôt' }) }));
    expect(api.confirm).toHaveBeenCalledWith(3, 9);
    expect(fixture.componentInstance.deposit()?.status).toBe('CONFIRMED');
    expect(notification.success).toHaveBeenCalled();
  });

  it('does not confirm when the user cancels the confirmation dialog', () => {
    api.findById.mockReturnValue(of({ ...confirmedDeposit, status: 'PREPARING', proofDocumentId: null,
      confirmedBy: null, confirmedAt: null }));
    dialog.open.mockReturnValue({ afterClosed: () => of(false) });
    const fixture = TestBed.createComponent(DepositDetailComponent);
    fixture.detectChanges();

    fixture.componentInstance.confirmDeposit();

    expect(api.confirm).not.toHaveBeenCalled();
    expect(fixture.componentInstance.deposit()?.status).toBe('PREPARING');
  });

  it('keeps the draft and notifies when confirmation is refused', () => {
    api.findById.mockReturnValue(of({ ...confirmedDeposit, status: 'PREPARING', proofDocumentId: null,
      confirmedBy: null, confirmedAt: null }));
    api.confirm.mockReturnValue(throwError(() => new Error('Confirmation refused')));
    const fixture = TestBed.createComponent(DepositDetailComponent);
    fixture.detectChanges();

    fixture.componentInstance.confirmDeposit();

    expect(fixture.componentInstance.deposit()?.status).toBe('PREPARING');
    expect(notification.error).toHaveBeenCalled();
  });

  it('lets an administrator read proofs without preparation actions', () => {
    auth.isAdmin.mockReturnValue(true);
    auth.hasRole.mockReturnValue(false);
    api.findById.mockReturnValue(of({ ...confirmedDeposit, status: 'PREPARING', proofDocumentId: null,
      confirmedBy: null, confirmedAt: null }));
    const fixture = TestBed.createComponent(DepositDetailComponent);
    fixture.detectChanges();
    expect(documents.findByOwner).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).not.toContain('Confirmer le dépôt');
  });
});

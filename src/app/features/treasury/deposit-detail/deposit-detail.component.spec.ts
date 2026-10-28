import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { DepositApiService } from '../deposit-api.service';
import { DepositDetailComponent } from './deposit-detail.component';
import { DocumentDetailDialogComponent } from '../../documents/dialogs/document-detail-dialog/document-detail-dialog.component';

describe('DepositDetailComponent', () => {
  const api = { findById: vi.fn() };
  const dialog = { open: vi.fn() };
  const auth = { isAdmin: () => false, hasRole: (role: string) => role === 'TREASURER' };

  beforeEach(async () => {
    vi.clearAllMocks();
    api.findById.mockReturnValue(of({
      id: 3, companyId: 1, targetAccountId: 2, amount: 40000,
      operationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', status: 'CONFIRMED',
      allocations: [{ paymentId: 11, amount: 40000 }], proofDocumentId: 9,
      createdBy: 'treasurer', createdAt: '2026-10-28T10:00:00Z',
      confirmedBy: 'treasurer', confirmedAt: '2026-10-28T11:00:00Z',
    }));
    await TestBed.configureTestingModule({
      imports: [DepositDetailComponent],
      providers: [provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ depositId: '3' }) } } },
        { provide: DepositApiService, useValue: api },
        { provide: AuthService, useValue: auth },
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
});

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmationDialogComponent } from '../../../shared/confirmation/confirmation-dialog.component';
import { DocumentAdministrationApiService } from '../../administration/documents/services/document-administration-api.service';
import { DocumentTypeView } from '../../administration/documents/models/document-admin.model';
import { CreateOwnerDocumentDialogComponent } from '../../documents/dialogs/create-owner-document-dialog/create-owner-document-dialog.component';
import { DocumentDetailDialogComponent } from '../../documents/dialogs/document-detail-dialog/document-detail-dialog.component';
import { DocumentApiService } from '../../documents/services/document-api.service';
import { DocumentComplianceItem, DocumentSummary } from '../../documents/models/document.model';
import { DepositApiService } from '../deposit-api.service';
import { DepositAllocationDetails, ExternalTreasuryAccount, TreasuryDeposit } from '../deposit.model';

@Component({
  selector: 'app-deposit-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule, MatSelectModule],
  templateUrl: './deposit-detail.component.html',
  styleUrl: './deposit-detail.component.scss',
})
export class DepositDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(DepositApiService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly documents = inject(DocumentApiService);
  private readonly documentAdmin = inject(DocumentAdministrationApiService);
  private readonly notification = inject(NotificationService);

  readonly deposit = signal<TreasuryDeposit | null>(null);
  readonly accounts = signal<ExternalTreasuryAccount[]>([]);
  readonly accountsUnavailable = signal(false);
  readonly allocationDetails = signal<DepositAllocationDetails[]>([]);
  readonly allocationDetailsUnavailable = signal(false);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly proofTypes = signal<DocumentTypeView[]>([]);
  readonly validProofs = signal<DocumentSummary[]>([]);
  readonly proofLoading = signal(false);
  readonly proofError = signal<string | null>(null);
  readonly confirming = signal(false);
  readonly cancelling = signal(false);
  readonly cancelledProofs = signal<DocumentSummary[]>([]);
  readonly cancellationReason = new FormControl('', {
    nonNullable: true, validators: [Validators.required, Validators.maxLength(500)],
  });
  readonly selectedTypeId = new FormControl<number | null>(null);
  readonly selectedProofId = new FormControl<number | null>(null);

  ngOnInit(): void {
    if (!this.auth.isAdmin() && !this.auth.hasRole('TREASURER')) {
      this.loading.set(false);
      this.error.set('La consultation est réservée aux administrateurs et aux trésoriers.');
      return;
    }
    const id = Number(this.route.snapshot.paramMap.get('depositId'));
    if (!Number.isInteger(id) || id <= 0) {
      this.loading.set(false);
      this.error.set('Identifiant du dépôt invalide.');
      return;
    }
    this.api.externalAccounts().subscribe({
      next: accounts => this.accounts.set(accounts),
      error: () => this.accountsUnavailable.set(true),
    });
    this.api.findById(id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: deposit => {
        this.deposit.set(deposit);
        this.api.allocationDetails(deposit.id).subscribe({
          next: details => this.allocationDetails.set(details),
          error: () => this.allocationDetailsUnavailable.set(true),
        });
        if (deposit.status === 'PREPARING') this.loadProofOptions();
        if (deposit.status === 'CANCELLED') this.loadCancelledProofs();
      },
      error: () => this.error.set('Dépôt introuvable ou inaccessible.'),
    });
  }

  canManage(): boolean {
    return this.auth.hasRole('TREASURER');
  }

  canRead(): boolean {
    return this.auth.isAdmin() || this.canManage();
  }

  accountName(accountId: number): string {
    return this.accounts().find(account => account.id === accountId)?.name ?? `Compte #${accountId}`;
  }

  accountDescription(accountId: number): string {
    const account = this.accounts().find(item => item.id === accountId);
    if (!account) return `Réf. #${accountId}`;
    return `${account.type === 'BANK' ? 'Banque' : 'Mobile money'} · ${account.currencyCode} · Réf. #${accountId}`;
  }

  accountCurrency(accountId: number): string {
    return this.accounts().find(item => item.id === accountId)?.currencyCode ?? '';
  }

  allocationInfo(paymentId: number): DepositAllocationDetails | undefined {
    return this.allocationDetails().find(item => item.paymentId === paymentId);
  }

  loadProofOptions(): void {
    const deposit = this.deposit();
    if (!deposit || deposit.status !== 'PREPARING' || !this.canRead()) return;
    this.proofLoading.set(true);
    this.proofError.set(null);
    forkJoin({
      types: this.documentAdmin.findDocumentTypes('TREASURY_DEPOSIT'),
      documents: this.documents.findByOwner({ ownerType: 'TREASURY_DEPOSIT', ownerId: deposit.id,
        status: 'VALID', page: 0, size: 100 }),
    }).pipe(finalize(() => this.proofLoading.set(false))).subscribe({
      next: ({ types, documents }) => {
        const activeTypes = types.filter(type => type.active);
        this.proofTypes.set(activeTypes);
        if (activeTypes.length === 1) this.selectedTypeId.setValue(activeTypes[0].id);
        this.validProofs.set(documents.content);
        if (!documents.content.some(document => document.documentId === this.selectedProofId.value)) {
          this.selectedProofId.setValue(documents.content[0]?.documentId ?? null);
        }
      },
      error: () => this.proofError.set('Impossible de charger les justificatifs du dépôt.'),
    });
  }

  uploadProof(): void {
    const deposit = this.deposit();
    if (!deposit || deposit.status !== 'PREPARING' || !this.canManage()) return;
    const type = this.proofTypes().find(candidate => candidate.id === this.selectedTypeId.value);
    if (!type) return;
    const item: DocumentComplianceItem = {
      requirementId: 0, documentTypeId: type.id, documentTypeCode: type.code,
      documentTypeLabel: type.label, required: true, expirationRequired: false,
      displayOrder: 0, complianceStatus: 'MISSING', blocking: false,
      documentId: null, documentTitle: null, activeVersionId: null,
      currentVersionNumber: null, issuedDate: null, expirationDate: null,
      daysUntilExpiration: null,
    };
    this.dialog.open(CreateOwnerDocumentDialogComponent, {
      width: '720px', maxWidth: '95vw', maxHeight: '92vh',
      data: { ownerType: 'TREASURY_DEPOSIT', ownerId: deposit.id, item },
    }).afterClosed().subscribe(uploaded => {
      if (uploaded) {
        this.notification.success('Justificatif ajouté au dépôt.');
        this.loadProofOptions();
      }
    });
  }

  confirmDeposit(): void {
    const deposit = this.deposit();
    const proofDocumentId = this.selectedProofId.value;
    if (!deposit || deposit.status !== 'PREPARING' || !this.canManage() ||
        !proofDocumentId || this.confirming() || this.proofLoading()) return;
    this.dialog.open(ConfirmationDialogComponent, {
      width: '480px', maxWidth: '95vw',
      data: {
        title: 'Confirmer le dépôt',
        message: `Confirmer le dépôt #${deposit.id} de ${deposit.amount} ? La collecte sera débitée et le compte cible crédité.`,
        confirmLabel: 'Confirmer le dépôt', cancelLabel: 'Annuler', tone: 'primary',
      },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.confirming.set(true);
      this.api.confirm(deposit.id, proofDocumentId)
        .pipe(finalize(() => this.confirming.set(false)))
        .subscribe({
          next: updated => {
            this.deposit.set(updated);
            this.notification.success('Dépôt confirmé. Les mouvements de trésorerie ont été enregistrés.');
          },
          error: () => this.notification.error(
            'Confirmation refusée. Vérifiez le justificatif, les recettes et le solde de la collecte.'),
        });
    });
  }

  cancelDeposit(): void {
    const deposit = this.deposit();
    const reason = this.cancellationReason.value.trim();
    if (!deposit || deposit.status !== 'PREPARING' || !this.canManage() || this.cancelling()
        || this.confirming() || !reason || reason.length > 500) {
      this.cancellationReason.markAsTouched();
      return;
    }
    this.dialog.open(ConfirmationDialogComponent, {
      width: '480px', maxWidth: '95vw',
      data: {
        title: 'Annuler la préparation',
        message: `Annuler le dépôt #${deposit.id} ? Les allocations et justificatifs resteront consultables. Aucun solde ne sera modifié. Motif : ${reason}`,
        confirmLabel: 'Annuler le dépôt', cancelLabel: 'Retour', tone: 'danger',
      },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed || this.cancelling() || this.deposit()?.status !== 'PREPARING') return;
      this.cancelling.set(true);
      this.api.cancel(deposit.id, reason).pipe(finalize(() => this.cancelling.set(false))).subscribe({
        next: updated => {
          this.deposit.set(updated);
          this.notification.success('Dépôt annulé. Aucun solde n’a été modifié.');
          this.loadCancelledProofs();
        },
        error: () => {
          this.notification.error('Annulation non confirmée. Vérifiez l’état du dépôt avant de réessayer.');
          this.api.findById(deposit.id).subscribe({
            next: current => { this.deposit.set(current); if (current.status === 'CANCELLED') this.loadCancelledProofs(); },
          });
        },
      });
    });
  }

  loadCancelledProofs(): void {
    const deposit = this.deposit();
    if (!deposit || deposit.status !== 'CANCELLED' || !this.canRead()) return;
    this.proofLoading.set(true);
    this.proofError.set(null);
    this.documents.findByOwner({ ownerType: 'TREASURY_DEPOSIT', ownerId: deposit.id,
      page: 0, size: 100 }).pipe(finalize(() => this.proofLoading.set(false))).subscribe({
      next: page => this.cancelledProofs.set(page.content),
      error: () => this.proofError.set('Impossible de charger les justificatifs conservés.'),
    });
  }

  viewCancelledProof(documentId: number): void {
    this.dialog.open(DocumentDetailDialogComponent, {
      width: '900px', maxWidth: '96vw', maxHeight: '92vh',
      data: { documentId, documentTypeLabel: 'Justificatif de dépôt', readOnly: true },
    });
  }

  viewProof(): void {
    const proofDocumentId = this.deposit()?.proofDocumentId;
    if (proofDocumentId == null) return;
    this.dialog.open(DocumentDetailDialogComponent, {
      width: '900px', maxWidth: '96vw', maxHeight: '92vh',
      data: { documentId: proofDocumentId, documentTypeLabel: 'Justificatif de dépôt', readOnly: true },
    });
  }

  viewSelectedProof(): void {
    const documentId = this.selectedProofId.value;
    if (!documentId) return;
    this.dialog.open(DocumentDetailDialogComponent, {
      width: '900px', maxWidth: '96vw', maxHeight: '92vh',
      data: { documentId, documentTypeLabel: 'Justificatif de dépôt', readOnly: true },
    });
  }
}

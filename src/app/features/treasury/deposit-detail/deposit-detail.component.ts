import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
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
import { TreasuryDeposit } from '../deposit.model';

@Component({
  selector: 'app-deposit-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatIconModule, MatProgressSpinnerModule, MatSelectModule],
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
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly proofTypes = signal<DocumentTypeView[]>([]);
  readonly validProofs = signal<DocumentSummary[]>([]);
  readonly proofLoading = signal(false);
  readonly proofError = signal<string | null>(null);
  readonly confirming = signal(false);
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
    this.api.findById(id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: deposit => {
        this.deposit.set(deposit);
        if (deposit.status === 'PREPARING') this.loadProofOptions();
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

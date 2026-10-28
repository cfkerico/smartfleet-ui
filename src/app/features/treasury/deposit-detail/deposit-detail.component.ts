import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { DocumentDetailDialogComponent } from '../../documents/dialogs/document-detail-dialog/document-detail-dialog.component';
import { DepositApiService } from '../deposit-api.service';
import { TreasuryDeposit } from '../deposit.model';

@Component({
  selector: 'app-deposit-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './deposit-detail.component.html',
  styleUrl: './deposit-detail.component.scss',
})
export class DepositDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(DepositApiService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly deposit = signal<TreasuryDeposit | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

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
      next: deposit => this.deposit.set(deposit),
      error: () => this.error.set('Dépôt introuvable ou inaccessible.'),
    });
  }

  viewProof(): void {
    const proofDocumentId = this.deposit()?.proofDocumentId;
    if (proofDocumentId == null) return;
    this.dialog.open(DocumentDetailDialogComponent, {
      width: '760px', maxWidth: '96vw', maxHeight: '92vh',
      data: { documentId: proofDocumentId, documentTypeLabel: 'Justificatif de dépôt', readOnly: true },
    });
  }
}

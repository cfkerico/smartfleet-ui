import { CommonModule } from '@angular/common';
import { 
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { finalize } from 'rxjs';

import { DocumentOwnerType } from '../../../../shared/models/document-owner-type.model';
import {
  DocumentComplianceItem,
  DocumentComplianceStatus,
  OwnerDocumentCompliance
} from '../../models/document.model';
import { DocumentApiService } from '../../services/document-api.service';

@Component({
  selector: 'app-owner-document-compliance',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './owner-document-compliance.component.html',
  styleUrl: './owner-document-compliance.component.scss',
})
export class OwnerDocumentComplianceComponent {

  readonly ownerType = input.required<DocumentOwnerType>();
  readonly ownerId = input.required<number>();

  readonly addRequested = output<DocumentComplianceItem>();
  readonly viewRequested = output<DocumentComplianceItem>();
  readonly replaceRequested = output<DocumentComplianceItem>();

  private readonly documentApi = inject(DocumentApiService);
  private readonly reloadTrigger = signal(0);

  readonly compliance = signal<OwnerDocumentCompliance | null>(null);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly items = computed(() => this.compliance()?.items ?? []);

  readonly missingItems = computed(() => this.items().filter(item => item.complianceStatus === 'MISSING'));

  readonly availableItems = computed(() => this.items().filter(item => item.complianceStatus !== 'MISSING'));

  readonly attentionItems = computed(() => 
    this.items().filter(item => 
         item.complianceStatus === 'EXPIRING_SOON'
      || item.complianceStatus === 'EXPIRED'
      || item.complianceStatus === 'INCOMPLETE'
      || item.complianceStatus === 'REJECTED'
      || item.complianceStatus === 'DRAFT'
    )
  )

  readonly compliancePercentage = computed(() => {
    const compliance = this.compliance();

    if (!compliance || compliance.totalRequired === 0) {
      return 100;
    }

    return Math.round((compliance.compliantRequired / compliance.totalRequired) * 100);
  });

  constructor() {
    effect(onCleanup => {
      const ownerType = this.ownerType();
      const ownerId = this.ownerId();

      /**
       * Cette lecture permettra à reload de se relancer
       */
      this.reloadTrigger();

      this.loading.set(true);
      this.error.set(null);

      const subscription = this.documentApi.findCompliance(ownerType, ownerId)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: compliance => {
            this.compliance.set(compliance);
          },
          error: () => {
            this.compliance.set(null);
            this.error.set('Impossible de charger la conformité documentaire.');
          },
        });

        /**
         * Si ownerType ou ownerId change pendant une requête, l'ancienne requête est annulée.
         */
        onCleanup(() => subscription.unsubscribe());
    });
  }

  reload(): void {
    this.reloadTrigger.update(value => value + 1);
  }

  trackByDocumentTypeId(_index: number, item: DocumentComplianceItem): number {
    return item.documentTypeId;
  }

  statusLabel(status: DocumentComplianceStatus): string {
    const labels: Record<DocumentComplianceStatus, string> = {
      MISSING: 'Manquant',
      DRAFT: 'Brouillon',
      INCOMPLETE: 'Incomplet',
      VALID: 'Valide',
      EXPIRING_SOON: 'Expire bientôt',
      EXPIRED: 'Expiré',
      REJECTED: 'Rejeté',
    };

    return labels[status];
  }

  statusIcon(status: DocumentComplianceStatus): string {
    const icons: Record<DocumentComplianceStatus, string> = {
      MISSING: 'add_circle_outline',
      DRAFT: 'edit_note',
      INCOMPLETE: 'warning_amber',
      VALID: 'check_circle',
      EXPIRING_SOON: 'schedule',
      EXPIRED: 'event_busy',
      REJECTED: 'cancel',
    };

    return icons[status];
  }

  statusClass(status: DocumentComplianceStatus): string {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }

  expirationLabel(item: DocumentComplianceItem): string {
    if (item.expirationDate === null) {
      return 'Sans expiration';
    }

    if (item.daysUntilExpiration === null) {
      return item.expirationDate;
    }

    if (item.daysUntilExpiration < 0) {
      const days = Math.abs(item.daysUntilExpiration);

      return `Expiré depuis ${days} jour${days > 1 ? 's' : ''}`;
    }

    if (item.daysUntilExpiration === 0) {
      return 'Expire aujourd’hui';
    }

    return `Expire dans ${item.daysUntilExpiration} jours`;
  }




}

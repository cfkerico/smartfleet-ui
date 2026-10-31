import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { filter, finalize, take } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DepositApiService } from '../deposit-api.service';
import { InitializeTreasuryRequest, TreasuryInitializationStatus } from '../deposit.model';

const AMOUNT_PATTERN = /^\d{1,17}(?:[.,]\d{1,2})?$/;

@Component({
  selector: 'app-treasury-initialization',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './treasury-initialization.component.html',
  styleUrl: './treasury-initialization.component.scss',
})
export class TreasuryInitializationComponent implements OnInit {
  private readonly api = inject(DepositApiService);
  private readonly auth = inject(AuthService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadError = signal(false);
  readonly status = signal<TreasuryInitializationStatus | null>(null);
  readonly form = new FormGroup({
    cutoverDate: new FormControl('', { nonNullable: true, validators: Validators.required }),
    currencyCode: new FormControl('', { nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[a-zA-Z]{3}$/)] }),
    collectionOpeningBalance: new FormControl('', { nonNullable: true,
      validators: [Validators.required, Validators.pattern(AMOUNT_PATTERN)] }),
    expenseCashOpeningBalance: new FormControl('', { nonNullable: true,
      validators: [Validators.required, Validators.pattern(AMOUNT_PATTERN)] }),
  });

  canManage(): boolean { return this.auth.isAdmin(); }

  ngOnInit(): void {
    if (this.canManage()) this.load();
  }

  load(): void {
    if (!this.canManage()) return;
    this.loading.set(true);
    this.loadError.set(false);
    this.api.getInitialization().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: status => this.status.set(status),
      error: () => {
        this.status.set(null);
        this.loadError.set(true);
        this.notification.error('Impossible de vérifier l’état de la trésorerie. Réessayez avant toute saisie.');
      },
    });
  }

  submit(event: Event): void {
    event.preventDefault();
    if (!this.canManage() || this.loading() || this.saving() || this.loadError()
        || this.status()?.initialized !== false) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request: InitializeTreasuryRequest = {
      cutoverDate: raw.cutoverDate,
      currencyCode: raw.currencyCode.trim().toUpperCase(),
      collectionOpeningBalance: raw.collectionOpeningBalance.replace(',', '.'),
      expenseCashOpeningBalance: raw.expenseCashOpeningBalance.replace(',', '.'),
    };
    this.confirmation.confirm({
      title: 'Initialiser la trésorerie',
      message: `Date de bascule : ${request.cutoverDate} ; devise : ${request.currencyCode} ; `
        + `espèces à déposer : ${request.collectionOpeningBalance} ; caisse de dépenses : `
        + `${request.expenseCashOpeningBalance}. Cette opération est unique et les soldes d’ouverture `
        + 'ne pourront pas être modifiés depuis cet écran. Confirmer ?',
      confirmLabel: 'Initialiser',
      cancelLabel: 'Annuler',
    }).pipe(take(1), filter(Boolean)).subscribe(() => {
      if (this.saving() || this.status()?.initialized !== false) return;
      this.saving.set(true);
      this.api.initializeTreasury(request).pipe(finalize(() => this.saving.set(false))).subscribe({
        next: result => {
          this.status.set({ initialized: true, cutoverDate: result.cutoverDate,
            currencyCode: result.currencyCode,
            collectionOpeningBalance: result.collectionOpeningBalance,
            expenseCashOpeningBalance: result.expenseCashOpeningBalance, initializedAt: null });
          this.notification.success('Trésorerie initialisée avec succès.');
          this.load();
        },
        error: () => {
          this.notification.error('Initialisation non confirmée. Vérifiez l’état avant de réessayer.');
          this.load();
        },
      });
    });
  }
}

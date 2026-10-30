import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DepositApiService } from '../deposit-api.service';
import { ExternalTreasuryAccount } from '../deposit.model';

@Component({
  selector: 'app-external-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatProgressSpinnerModule, MatSelectModule],
  templateUrl: './external-accounts.component.html',
  styleUrl: './external-accounts.component.scss',
})
export class ExternalAccountsComponent implements OnInit {
  private readonly api = inject(DepositApiService);
  private readonly auth = inject(AuthService);
  private readonly notification = inject(NotificationService);

  readonly accounts = signal<ExternalTreasuryAccount[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadError = signal(false);
  readonly type = new FormControl<'BANK' | 'MOBILE_MONEY' | null>(null, Validators.required);
  readonly name = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] });

  ngOnInit(): void {
    if (this.canRead()) this.load();
  }

  canRead(): boolean {
    return this.auth.isAdmin() || this.auth.hasRole('TREASURER');
  }

  canCreate(): boolean {
    return this.auth.isAdmin();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.api.externalAccounts().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: accounts => this.accounts.set(accounts),
      error: () => {
        this.accounts.set([]);
        this.loadError.set(true);
      },
    });
  }

  create(event: Event): void {
    event.preventDefault();
    if (!this.canCreate() || this.saving()) return;
    const name = this.name.value.trim();
    if (this.type.invalid || this.name.invalid || !name) {
      this.type.markAsTouched();
      this.name.markAsTouched();
      return;
    }
    this.saving.set(true);
    console.log('Creating external account with type+++++++++++++++++ :', this.type.value, 'and name:', name);
    this.api.createExternalAccount({ type: this.type.value!, name })
      .pipe(finalize(() => this.saving.set(false))).subscribe({
        next: account => {
          this.accounts.update(current => [...current, account]);
          this.type.reset();
          this.name.reset();
          this.notification.success('Compte de trésorerie créé avec succès.');
        },
        error: () => this.notification.error('Impossible de créer le compte de trésorerie.'),
      });
  }

  typeLabel(type: ExternalTreasuryAccount['type']): string {
    return type === 'BANK' ? 'Banque' : type === 'MOBILE_MONEY' ? 'Mobile Money' : 'Caisse de dépenses';
  }
}

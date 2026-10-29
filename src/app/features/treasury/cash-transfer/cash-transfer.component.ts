import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { finalize, filter, take } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DepositApiService } from '../deposit-api.service';
import { CashTreasuryAccount, TransferCollectionCashResult } from '../deposit.model';

@Component({
  selector: 'app-cash-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './cash-transfer.component.html',
  styleUrl: './cash-transfer.component.scss',
})
export class CashTransferComponent implements OnInit {
  private readonly api = inject(DepositApiService);
  private readonly auth = inject(AuthService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly notification = inject(NotificationService);

  readonly accounts = signal<CashTreasuryAccount[]>([]);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly result = signal<TransferCollectionCashResult | null>(null);
  readonly uncertain = signal(false);
  readonly amount = new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]);
  private operationId: string | null = null;

  ngOnInit(): void { if (this.canTransfer()) this.load(); }
  canTransfer(): boolean { return this.auth.hasRole('TREASURER'); }
  collection(): CashTreasuryAccount | undefined {
    return this.accounts().find(account => account.type === 'COLLECTION_CASH');
  }
  expenses(): CashTreasuryAccount | undefined {
    return this.accounts().find(account => account.type === 'EXPENSE_CASH');
  }
  canSubmit(): boolean {
    const amount = this.amount.value;
    return !this.loading() && !this.submitting() && !this.result() && this.amount.valid
      && !!this.collection()?.active && !!this.expenses()?.active && amount !== null
      && amount <= (this.collection()?.balance ?? 0);
  }
  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.cashAccounts().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: accounts => this.accounts.set(accounts),
      error: () => this.error.set('Impossible de charger les soldes des caisses.'),
    });
  }
  submit(): void {
    if (!this.canTransfer() || !this.canSubmit()) return;
    const source = this.collection()!;
    const target = this.expenses()!;
    const amount = this.amount.value!;
    this.confirmation.confirm({
      title: 'Confirmer le transfert',
      message: `Transférer ${amount.toFixed(2)} ${source.currencyCode} de « ${source.name} » vers « ${target.name} » ?`,
      confirmLabel: 'Confirmer le transfert',
      cancelLabel: 'Annuler',
    }).pipe(take(1), filter(Boolean)).subscribe(() => {
      this.operationId ??= crypto.randomUUID();
      this.submitting.set(true);
      this.error.set(null);
      this.api.transferCollectionCash({ collectionAccountId: source.id, expenseCashAccountId: target.id,
        amount, operationId: this.operationId })
        .pipe(finalize(() => this.submitting.set(false))).subscribe({
          next: result => {
            this.result.set(result);
            this.uncertain.set(false);
            this.accounts.update(accounts => accounts.map(account => account.id === source.id
              ? { ...account, balance: result.collectionBalance }
              : account.id === target.id ? { ...account, balance: result.expenseCashBalance } : account));
            this.notification.success('Transfert effectué. Les deux soldes ont été actualisés.');
          },
          error: () => {
            this.uncertain.set(true);
            this.error.set('Transfert non confirmé. Vérifiez les mouvements avant toute nouvelle opération. Une nouvelle tentative conservera la même référence.');
            this.notification.error('Impossible de confirmer le résultat du transfert.');
          },
        });
    });
  }
  newOperation(): void {
    this.operationId = null;
    this.result.set(null);
    this.uncertain.set(false);
    this.amount.reset();
    this.load();
  }
}

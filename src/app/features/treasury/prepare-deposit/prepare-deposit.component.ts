import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DepositApiService } from '../deposit-api.service';
import { EligibleDepositPayment, ExternalTreasuryAccount } from '../deposit.model';

interface SelectedPayment {
  payment: EligibleDepositPayment;
  amount: number;
}

@Component({
  selector: 'app-prepare-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatIconModule, MatPaginatorModule, MatProgressSpinnerModule, MatSelectModule],
  templateUrl: './prepare-deposit.component.html',
  styleUrl: './prepare-deposit.component.scss',
})
export class PrepareDepositComponent implements OnInit {
  private readonly api = inject(DepositApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private operationId: string | null = null;

  readonly targetAccountId = new FormControl<number | null>(null, Validators.required);
  readonly accounts = signal<ExternalTreasuryAccount[]>([]);
  readonly payments = signal<EligibleDepositPayment[]>([]);
  readonly selection = signal<Record<number, SelectedPayment>>({});
  readonly loading = signal(true);
  readonly paymentsLoading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly totalElements = signal(0);
  readonly selectedTotal = computed(() => Object.values(this.selection())
    .reduce((total, item) => total + item.amount, 0));
  readonly selectedCount = computed(() => Object.keys(this.selection()).length);

  ngOnInit(): void {
    if (!this.canPrepare()) {
      this.loading.set(false);
      return;
    }
    this.loadInitial();
  }

  canPrepare(): boolean {
    return this.auth.hasRole('TREASURER');
  }

  loadInitial(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ accounts: this.api.externalAccounts(), payments: this.api.eligiblePayments(0, this.pageSize()) })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ accounts, payments }) => {
          this.accounts.set(accounts.filter(account => account.active &&
            (account.type === 'BANK' || account.type === 'MOBILE_MONEY')));
          this.setPaymentPage(payments);
        },
        error: () => this.error.set('Impossible de charger les comptes et recettes déposables.'),
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.paymentsLoading.set(true);
    this.error.set(null);
    this.api.eligiblePayments(event.pageIndex, event.pageSize)
      .pipe(finalize(() => this.paymentsLoading.set(false)))
      .subscribe({
        next: page => this.setPaymentPage(page),
        error: () => this.error.set('Impossible de charger cette page de recettes.'),
      });
  }

  private setPaymentPage(page: { content: EligibleDepositPayment[]; totalElements: number }): void {
    this.payments.set(page.content);
    this.totalElements.set(page.totalElements);
  }

  selectedAmount(paymentId: number): number | null {
    return this.selection()[paymentId]?.amount ?? null;
  }

  setAmount(payment: EligibleDepositPayment, event: Event): void {
    const amount = Number((event.target as HTMLInputElement).value);
    this.selection.update(current => {
      const next = { ...current };
      if (!Number.isFinite(amount) || amount <= 0) {
        delete next[payment.paymentId];
      } else {
        next[payment.paymentId] = { payment, amount };
      }
      return next;
    });
  }

  canSubmit(): boolean {
    const selected = Object.values(this.selection());
    return !this.loading() && !this.paymentsLoading() && !this.saving() &&
      this.targetAccountId.valid && selected.length > 0 &&
      selected.every(item => Number.isFinite(item.amount) && item.amount >= 0.01 &&
        Math.abs(item.amount * 100 - Math.round(item.amount * 100)) < 0.000001 &&
        item.amount <= item.payment.remainingAmount);
  }

  prepare(): void {
    if (!this.canPrepare() || !this.canSubmit()) return;
    const targetAccountId = this.targetAccountId.value;
    if (targetAccountId === null) return;
    this.operationId ??= globalThis.crypto.randomUUID();
    this.saving.set(true);
    this.api.prepare({
      targetAccountId,
      operationId: this.operationId,
      allocations: Object.values(this.selection()).map(item => ({
        paymentId: item.payment.paymentId, amount: item.amount,
      })),
    }).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: deposit => {
        this.notification.success('Dépôt préparé. Ajoutez un justificatif avant de le confirmer.');
        void this.router.navigate(['/treasury/deposits', deposit.id]);
      },
      error: () => this.notification.error(
        'Préparation impossible. Vérifiez les montants ; en cas de doute, consultez la liste avant de réessayer.'),
    });
  }
}

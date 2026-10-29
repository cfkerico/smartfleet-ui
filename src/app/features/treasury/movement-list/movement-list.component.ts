import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { DepositApiService } from '../deposit-api.service';
import { CashTreasuryAccount, ExternalTreasuryAccount, TreasuryMovement,
  TreasuryMovementPrefix } from '../deposit.model';

@Component({
  selector: 'app-movement-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatPaginatorModule, MatSelectModule, MatTableModule],
  templateUrl: './movement-list.component.html',
  styleUrl: './movement-list.component.scss',
})
export class MovementListComponent implements OnInit {
  private readonly api = inject(DepositApiService);
  private readonly auth = inject(AuthService);
  readonly accounts = signal<(CashTreasuryAccount | ExternalTreasuryAccount)[]>([]);
  readonly movements = signal<TreasuryMovement[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly accountsError = signal(false);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly totalElements = signal(0);
  readonly account = new FormControl<number | null>(null);
  readonly from = new FormControl<string | null>(null);
  readonly to = new FormControl<string | null>(null);
  readonly prefix = new FormControl<TreasuryMovementPrefix | null>(null);
  readonly columns = ['recordedAt', 'account', 'reference', 'direction', 'amount', 'balanceAfter'];

  ngOnInit(): void {
    if (!this.canRead()) return;
    this.loadAccounts();
    this.load();
  }
  canRead(): boolean { return this.auth.isAdmin() || this.auth.hasRole('TREASURER'); }
  loadAccounts(): void {
    this.accountsError.set(false);
    forkJoin([this.api.cashAccounts(), this.api.externalAccounts()]).subscribe({
      next: ([cash, external]) => this.accounts.set([...cash, ...external]),
      error: () => this.accountsError.set(true),
    });
  }
  applyFilters(): void {
    if (this.from.value && this.to.value && this.from.value > this.to.value) {
      this.error.set('La date de début doit précéder la date de fin.');
      return;
    }
    this.pageIndex.set(0);
    this.load();
  }
  resetFilters(): void {
    this.account.setValue(null);
    this.from.setValue(null);
    this.to.setValue(null);
    this.prefix.setValue(null);
    this.pageIndex.set(0);
    this.load();
  }
  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }
  load(): void {
    if (!this.canRead()) return;
    this.loading.set(true);
    this.error.set(null);
    this.api.movements({ accountId: this.account.value, from: this.from.value, to: this.to.value,
      referencePrefix: this.prefix.value, page: this.pageIndex(), size: this.pageSize() })
      .pipe(finalize(() => this.loading.set(false))).subscribe({
        next: result => {
          this.movements.set(result.content);
          this.totalElements.set(result.totalElements);
        },
        error: () => {
          this.movements.set([]);
          this.totalElements.set(0);
          this.error.set('Impossible de charger les mouvements.');
        },
      });
  }
  accountName(id: number): string {
    return this.accounts().find(item => item.id === id)?.name ?? `Compte #${id}`;
  }
  category(reference: string): string {
    if (reference.startsWith('EXPENSE-DISBURSEMENT-')) return 'Décaissement';
    if (reference.startsWith('PAYMENT-') && reference.includes('-CORR-')) return 'Correction de recette';
    if (reference.startsWith('PAYMENT-')) return 'Recette';
    if (reference.startsWith('TRANSFER-')) return 'Transfert';
    if (reference.startsWith('DEPOSIT-')) return 'Dépôt';
    if (reference.startsWith('OPENING-')) return 'Solde d’ouverture';
    return 'Autre mouvement';
  }
}

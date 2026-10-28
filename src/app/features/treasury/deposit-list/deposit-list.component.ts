import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { DepositApiService } from '../deposit-api.service';
import { TreasuryDeposit, TreasuryDepositStatus } from '../deposit.model';

@Component({
  selector: 'app-deposit-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatIconModule, MatPaginatorModule, MatProgressSpinnerModule,
    MatSelectModule, MatTableModule],
  templateUrl: './deposit-list.component.html',
  styleUrl: './deposit-list.component.scss',
})
export class DepositListComponent implements OnInit {
  private readonly api = inject(DepositApiService);
  private readonly auth = inject(AuthService);

  readonly status = new FormControl<TreasuryDepositStatus | null>(null);
  readonly deposits = signal<TreasuryDeposit[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly columns = ['createdAt', 'id', 'target', 'amount', 'status', 'actions'];

  ngOnInit(): void {
    if (!this.canRead()) return;
    this.status.valueChanges.subscribe(() => {
      this.pageIndex.set(0);
      this.load();
    });
    this.load();
  }

  canRead(): boolean {
    return this.auth.isAdmin() || this.auth.hasRole('TREASURER');
  }

  canPrepare(): boolean {
    return this.auth.hasRole('TREASURER');
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list(this.status.value, this.pageIndex(), this.pageSize())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: page => {
          this.deposits.set(page.content);
          this.totalElements.set(page.totalElements);
        },
        error: () => {
          this.deposits.set([]);
          this.totalElements.set(0);
          this.error.set('Impossible de charger les dépôts.');
        },
      });
  }

  statusLabel(status: TreasuryDepositStatus): string {
    return status === 'CONFIRMED' ? 'Confirmé' : 'En préparation';
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { DashboardAnalytics } from '../../models/dashboard-analytics.model';
import { FleetOperationsPage } from '../../models/fleet-operations.model';
import { MonthlyOperationsSeries } from '../../models/monthly-operations.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, MatPaginatorModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal(false);
  readonly analytics = signal<DashboardAnalytics | null>(null);
  readonly fleet = signal<FleetOperationsPage | null>(null);
  readonly fleetLoading = signal(false);
  readonly fleetError = signal(false);
  readonly monthly = signal<MonthlyOperationsSeries | null>(null);
  readonly monthlyLoading = signal(false);
  readonly monthlyError = signal(false);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);
  readonly period = new FormGroup({
    from: new FormControl('', { nonNullable: true, validators: Validators.required }),
    to: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  readonly monthlyPeriod = new FormGroup({
    fromMonth: new FormControl('', { nonNullable: true, validators: Validators.required }),
    toMonth: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  canSeeFinancials(): boolean {
    return this.auth.isAdmin() || this.auth.hasRole('TREASURER');
  }

  ngOnInit(): void {
    if (this.canSeeFinancials()) {
      this.load();
      this.loadMonthly();
    }
  }

  load(from?: string, to?: string): void {
    if (!this.canSeeFinancials() || this.loading() || this.fleetLoading()) return;
    this.pageIndex.set(0);
    this.loading.set(true);
    this.error.set(false);
    this.analytics.set(null);
    this.analyticsService.getDashboard(from, to).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: result => {
        this.analytics.set(result);
        this.period.setValue({ from: result.fromInclusive, to: result.toInclusive });
      },
      error: () => this.error.set(true),
    });
    this.loadFleet(0, this.pageSize(), from, to);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    const { from, to } = this.period.getRawValue();
    this.loadFleet(event.pageIndex, event.pageSize, from || undefined, to || undefined);
  }

  retryFleet(): void {
    const { from, to } = this.period.getRawValue();
    this.loadFleet(this.pageIndex(), this.pageSize(), from || undefined, to || undefined);
  }

  applyMonthlyPeriod(event: Event): void {
    event.preventDefault();
    const { fromMonth, toMonth } = this.monthlyPeriod.getRawValue();
    if (this.monthlyPeriod.invalid || fromMonth > toMonth || this.monthDistance(fromMonth, toMonth) > 24) {
      this.monthlyPeriod.markAllAsTouched();
      return;
    }
    this.loadMonthly(fromMonth, toMonth);
  }

  loadMonthly(fromMonth?: string, toMonth?: string): void {
    if (!this.canSeeFinancials() || this.monthlyLoading()) return;
    this.monthlyLoading.set(true);
    this.monthlyError.set(false);
    this.monthly.set(null);
    this.analyticsService.getMonthlyOperations(fromMonth, toMonth).pipe(
      finalize(() => this.monthlyLoading.set(false)),
    ).subscribe({
      next: result => {
        this.monthly.set(result);
        this.monthlyPeriod.setValue({ fromMonth: result.fromMonth, toMonth: result.toMonth });
      },
      error: () => this.monthlyError.set(true),
    });
  }

  monthBarWidth(amount: number, months: MonthlyOperationsSeries['months']): number {
    const maximum = Math.max(1, ...months.flatMap(month => [month.recordedRevenue, month.disbursedExpenses]));
    return Math.max(0, amount / maximum * 70);
  }

  monthDistance(fromMonth: string, toMonth: string): number {
    if (!/^\d{4}-\d{2}$/.test(fromMonth) || !/^\d{4}-\d{2}$/.test(toMonth)) return 0;
    const [fromYear, fromNumber] = fromMonth.split('-').map(Number);
    const [toYear, toNumber] = toMonth.split('-').map(Number);
    return (toYear - fromYear) * 12 + toNumber - fromNumber + 1;
  }

  monthLabel(month: string): string {
    const [year, number] = month.split('-').map(Number);
    return new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(Date.UTC(year, number - 1, 1)));
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      AVAILABLE: 'Disponible', ASSIGNED: 'Affecté', MAINTENANCE: 'En entretien',
      BLOCKED: 'Bloqué', SUSPENDED: 'Suspendu', SOLD: 'Vendu',
      INACTIVE: 'Inactif', INVALID: 'Invalide',
    };
    return labels[status] ?? status;
  }

  private loadFleet(page: number, size: number, from?: string, to?: string): void {
    if (!this.canSeeFinancials()) return;
    this.fleetLoading.set(true);
    this.fleetError.set(false);
    this.fleet.set(null);
    this.analyticsService.getFleetOperations(page, size, from, to).pipe(
      finalize(() => this.fleetLoading.set(false)),
    ).subscribe({
      next: result => this.fleet.set(result),
      error: () => this.fleetError.set(true),
    });
  }

  applyPeriod(event: Event): void {
    event.preventDefault();
    const { from, to } = this.period.getRawValue();
    if (this.period.invalid || from > to) {
      this.period.markAllAsTouched();
      return;
    }
    this.load(from, to);
  }

  formatAmount(value: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
  }
}

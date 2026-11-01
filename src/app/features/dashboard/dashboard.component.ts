import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { DashboardAnalytics } from '../../models/dashboard-analytics.model';
import { FleetOperationsPage } from '../../models/fleet-operations.model';
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
  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);
  readonly period = new FormGroup({
    from: new FormControl('', { nonNullable: true, validators: Validators.required }),
    to: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  canSeeFinancials(): boolean {
    return this.auth.isAdmin() || this.auth.hasRole('TREASURER');
  }

  ngOnInit(): void {
    if (this.canSeeFinancials()) this.load();
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

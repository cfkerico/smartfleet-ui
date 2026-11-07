import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AnalyticsService } from '../../core/services/analytics.service';
import { NotificationService } from '../../core/services/notification.service';
import { FleetOperationsPage } from '../../models/fleet-operations.model';
import { MonthlyOperationsSeries } from '../../models/monthly-operations.model';
import { ExpenseCategoryReport } from '../../models/expense-category-report.model';
import { downloadBlob, downloadCsv, fleetPageCsv, monthlyReportCsv } from './report-csv';

@Component({
  standalone: true,
  selector: 'app-operations-reports',
  imports: [ReactiveFormsModule, MatPaginatorModule, RouterLink],
  templateUrl: './operations-reports.component.html',
  styleUrl: './operations-reports.component.scss',
})
export class OperationsReportsComponent implements OnInit {
  private readonly analytics = inject(AnalyticsService);
  private readonly notification = inject(NotificationService);

  readonly monthly = signal<MonthlyOperationsSeries | null>(null);
  readonly monthlyLoading = signal(false);
  readonly monthlyError = signal(false);
  readonly fleet = signal<FleetOperationsPage | null>(null);
  readonly fleetLoading = signal(false);
  readonly fleetError = signal(false);
  readonly fullExportLoading = signal(false);
  readonly expenseCategories = signal<ExpenseCategoryReport | null>(null);
  readonly expenseCategoriesLoading = signal(false);
  readonly expenseCategoriesError = signal(false);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly monthlyPeriod = new FormGroup({
    fromMonth: new FormControl('', { nonNullable: true, validators: Validators.required }),
    toMonth: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  readonly fleetPeriod = new FormGroup({
    from: new FormControl('', { nonNullable: true, validators: Validators.required }),
    to: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  readonly expenseCategoryPeriod = new FormGroup({
    from: new FormControl('', { nonNullable: true, validators: Validators.required }),
    to: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  ngOnInit(): void {
    this.loadMonthly();
    this.loadFleet();
    this.loadExpenseCategories();
  }

  applyMonthlyPeriod(event: Event): void {
    event.preventDefault();
    const { fromMonth, toMonth } = this.monthlyPeriod.getRawValue();
    if (this.monthlyPeriod.invalid || fromMonth > toMonth || this.monthCount(fromMonth, toMonth) > 24) {
      this.monthlyPeriod.markAllAsTouched();
      return;
    }
    this.loadMonthly(fromMonth, toMonth);
  }

  loadMonthly(fromMonth?: string, toMonth?: string): void {
    if (this.monthlyLoading()) return;
    this.monthlyLoading.set(true);
    this.monthlyError.set(false);
    this.monthly.set(null);
    this.analytics.getMonthlyOperations(fromMonth, toMonth).pipe(
      finalize(() => this.monthlyLoading.set(false)),
    ).subscribe({
      next: result => {
        this.monthly.set(result);
        this.monthlyPeriod.setValue({ fromMonth: result.fromMonth, toMonth: result.toMonth });
      },
      error: () => this.monthlyError.set(true),
    });
  }

  applyFleetPeriod(event: Event): void {
    event.preventDefault();
    const { from, to } = this.fleetPeriod.getRawValue();
    if (this.fleetPeriod.invalid || from > to) {
      this.fleetPeriod.markAllAsTouched();
      return;
    }
    this.pageIndex.set(0);
    this.loadFleet(0, this.pageSize(), from, to);
  }

  changeFleetPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    const { from, to } = this.fleetPeriod.getRawValue();
    this.loadFleet(event.pageIndex, event.pageSize, from || undefined, to || undefined);
  }

  loadFleet(page = this.pageIndex(), size = this.pageSize(), from?: string, to?: string): void {
    if (this.fleetLoading()) return;
    this.fleetLoading.set(true);
    this.fleetError.set(false);
    this.fleet.set(null);
    this.analytics.getFleetOperations(page, size, from, to).pipe(
      finalize(() => this.fleetLoading.set(false)),
    ).subscribe({
      next: result => {
        this.fleet.set(result);
        this.fleetPeriod.setValue({ from: result.fromInclusive, to: result.toInclusive });
      },
      error: () => this.fleetError.set(true),
    });
  }

  retryFleet(): void {
    const { from, to } = this.fleetPeriod.getRawValue();
    this.loadFleet(this.pageIndex(), this.pageSize(), from || undefined, to || undefined);
  }

  applyExpenseCategoryPeriod(event: Event): void {
    event.preventDefault();
    const { from, to } = this.expenseCategoryPeriod.getRawValue();
    if (this.expenseCategoryPeriod.invalid || from > to) {
      this.expenseCategoryPeriod.markAllAsTouched();
      return;
    }
    this.loadExpenseCategories(from, to);
  }

  loadExpenseCategories(from?: string, to?: string): void {
    if (this.expenseCategoriesLoading()) return;
    this.expenseCategoriesLoading.set(true);
    this.expenseCategoriesError.set(false);
    this.expenseCategories.set(null);
    this.analytics.getExpenseCategoryReport(from, to).pipe(
      finalize(() => this.expenseCategoriesLoading.set(false)),
    ).subscribe({
      next: result => {
        this.expenseCategories.set(result);
        this.expenseCategoryPeriod.setValue({ from: result.fromInclusive, to: result.toInclusive });
      },
      error: () => this.expenseCategoriesError.set(true),
    });
  }

  retryExpenseCategories(): void {
    const { from, to } = this.expenseCategoryPeriod.getRawValue();
    this.loadExpenseCategories(from || undefined, to || undefined);
  }

  expenseCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      FUEL: 'Carburant', MAINTENANCE: 'Entretien', REPAIR: 'Réparation',
      SPARE_PART: 'Pièces détachées', INSURANCE: 'Assurance', TAX: 'Taxes',
      DOCUMENT: 'Documents', SALARY: 'Salaires', UTILITY: 'Fournitures', OTHER: 'Autres',
    };
    return labels[category] ?? category;
  }

  exportMonthly(): void {
    const data = this.monthly();
    if (!data) return;
    downloadCsv(`smartfleet-mensuel-${data.fromMonth}-${data.toMonth}.csv`, monthlyReportCsv(data));
  }

  exportFleetPage(): void {
    const data = this.fleet();
    if (!data) return;
    downloadCsv(`smartfleet-vehicules-${data.fromInclusive}-${data.toInclusive}-page-${data.page + 1}.csv`,
      fleetPageCsv(data, status => this.statusLabel(status)));
  }

  exportAllVehicles(): void {
    const data = this.fleet();
    if (!data || this.fullExportLoading()) return;
    this.fullExportLoading.set(true);
    this.analytics.exportFleetOperations(data.fromInclusive, data.toInclusive).pipe(
      finalize(() => this.fullExportLoading.set(false)),
    ).subscribe({
      next: blob => {
        downloadBlob(`smartfleet-vehicules-complet-${data.fromInclusive}-${data.toInclusive}.csv`, blob);
        this.notification.success('Export complet des véhicules lancé.');
      },
      error: () => this.notification.error('Export complet impossible. Réessayez après vérification de la connexion.'),
    });
  }

  monthCount(from: string, to: string): number {
    if (!/^\d{4}-\d{2}$/.test(from) || !/^\d{4}-\d{2}$/.test(to)) return 0;
    const [fromYear, fromMonth] = from.split('-').map(Number);
    const [toYear, toMonth] = to.split('-').map(Number);
    return (toYear - fromYear) * 12 + toMonth - fromMonth + 1;
  }

  formatAmount(value: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      AVAILABLE: 'Disponible', ASSIGNED: 'Affecté', MAINTENANCE: 'En entretien',
      BLOCKED: 'Bloqué', SUSPENDED: 'Suspendu', SOLD: 'Vendu',
      INACTIVE: 'Inactif', INVALID: 'Invalide',
    };
    return labels[status] ?? status;
  }
}

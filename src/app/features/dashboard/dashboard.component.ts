import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { DashboardAnalytics } from '../../models/dashboard-analytics.model';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal(false);
  readonly analytics = signal<DashboardAnalytics | null>(null);
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
    if (!this.canSeeFinancials() || this.loading()) return;
    this.loading.set(true);
    this.error.set(false);
    this.analyticsService.getDashboard(from, to).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: result => {
        this.analytics.set(result);
        this.period.setValue({ from: result.fromInclusive, to: result.toInclusive });
      },
      error: () => this.error.set(true),
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

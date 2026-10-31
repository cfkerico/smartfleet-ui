import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AssignmentFormComponent, AssignmentFormData } from '../../assignment/assignment-form/assignment-form.component';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { PaymentFormComponent, PaymentFormData } from '../../payment/payment-form/payment-form.component';
import { CreateExpenseDialogComponent, CreateExpenseDialogData } from '../../expenses/create-expense-dialog/create-expense-dialog.component';
import { VehicleAssignment } from '../../../models/assignment.model';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { VehiclePageHeaderComponent } from '../components/vehicle-page-header/vehicle-page-header.component';
import { AuthService } from '../../../core/auth/auth.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { VehicleOperations } from '../../../models/vehicle-operations.model';

@Component({
  selector: 'app-vehicle-detail-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, VehiclePageHeaderComponent],
  templateUrl: './vehicle-detail-page.component.html',
  styleUrls: ['../../shared/entity-detail-page.scss', './vehicle-detail-page.component.scss'],
})
export class VehicleDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly vehicleService = inject(VehicleService);
  private readonly assignmentService = inject(AssignmentApiService);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthService);
  private readonly analyticsService = inject(AnalyticsService);

  readonly vehicle = signal<Vehicle | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeAssignments = signal<VehicleAssignment[]>([]);
  readonly assignmentsLoaded = signal(false);
  readonly assignmentsError = signal(false);
  readonly operations = signal<VehicleOperations | null>(null);
  readonly operationsLoading = signal(false);
  readonly operationsError = signal(false);
  readonly operationsPeriod = new FormGroup({
    from: new FormControl('', { nonNullable: true, validators: Validators.required }),
    to: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  canSeeOperations(): boolean {
    return this.auth.isAdmin() || this.auth.hasRole('TREASURER');
  }

  applyOperationsPeriod(event: Event): void {
    event.preventDefault();
    const { from, to } = this.operationsPeriod.getRawValue();
    if (this.operationsPeriod.invalid || from > to) {
      this.operationsPeriod.markAllAsTouched();
      return;
    }
    const vehicle = this.vehicle();
    if (vehicle) this.loadOperations(vehicle.id, from, to);
  }

  formatAmount(value: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
  }

  ngOnInit(): void {
    const vehicleId = Number(this.route.snapshot.paramMap.get('vehicleId'));
    if (!Number.isSafeInteger(vehicleId) || vehicleId <= 0) {
      this.loading.set(false);
      this.error.set('Identifiant du véhicule invalide.');
      return;
    }

    this.loadVehicle(vehicleId);
  }

  openAssignment(): void {
    const vehicle = this.vehicle();
    if (!vehicle || vehicle.vehicleStatus !== 'AVAILABLE') return;

    const data: AssignmentFormData = { mode: 'CREATE', preselectedVehicle: vehicle };
    this.dialog.open<AssignmentFormComponent, AssignmentFormData, boolean>(AssignmentFormComponent, {
      width: '800px', maxWidth: '96vw', maxHeight: '90vh', data,
    }).afterClosed().subscribe(created => {
      if (created === true) this.loadVehicle(vehicle.id);
    });
  }

  openExpense(): void {
    const vehicle = this.vehicle();
    if (!vehicle || vehicle.vehicleStatus === 'INACTIVE' || vehicle.vehicleStatus === 'SOLD') return;

    const data: CreateExpenseDialogData = { preselectedVehicle: vehicle };
    this.dialog.open<CreateExpenseDialogComponent, CreateExpenseDialogData, boolean>(CreateExpenseDialogComponent, {
      width: '680px', maxWidth: '96vw', maxHeight: '90vh', data,
    }).afterClosed().subscribe(created => {
      if (created === true) this.loadVehicle(vehicle.id);
    });
  }

  openPayment(): void {
    const vehicle = this.vehicle();
    if (!vehicle || vehicle.vehicleStatus === 'INACTIVE' || this.activeAssignments().length === 0) return;

    const data: PaymentFormData = { vehicleId: vehicle.id };
    this.dialog.open<PaymentFormComponent, PaymentFormData, boolean>(PaymentFormComponent, {
      width: '720px', maxWidth: '96vw', maxHeight: '90vh', data,
    }).afterClosed().subscribe(created => {
      if (created === true) this.loadVehicle(vehicle.id);
    });
  }

  private loadActiveAssignments(vehicleId: number): void {
    this.activeAssignments.set([]);
    this.assignmentsLoaded.set(false);
    this.assignmentsError.set(false);
    this.assignmentService.findActiveAssignments().subscribe({
      next: assignments => {
        this.activeAssignments.set(assignments.filter(a => a.vehicleId === vehicleId));
        this.assignmentsLoaded.set(true);
      },
      error: () => {
        this.assignmentsError.set(true);
        this.assignmentsLoaded.set(true);
      },
    });
  }

  private loadVehicle(vehicleId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.vehicleService.getById(vehicleId).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: vehicle => {
        this.vehicle.set(vehicle);
        if (this.canSeeOperations()) {
          const { from, to } = this.operationsPeriod.getRawValue();
          this.loadOperations(vehicle.id, from && to ? from : undefined, from && to ? to : undefined);
        }
        if (vehicle.vehicleStatus !== 'INACTIVE') this.loadActiveAssignments(vehicle.id);
        else {
          this.activeAssignments.set([]);
          this.assignmentsLoaded.set(true);
          this.assignmentsError.set(false);
        }
      },
      error: () => {
        this.vehicle.set(null);
        this.error.set('Impossible de charger ce véhicule.');
      },
    });
  }

  private loadOperations(vehicleId: number, from?: string, to?: string): void {
    if (!this.canSeeOperations()) return;
    this.operationsLoading.set(true);
    this.operationsError.set(false);
    this.operations.set(null);
    this.analyticsService.getVehicleOperations(vehicleId, from, to).pipe(
      finalize(() => this.operationsLoading.set(false)),
    ).subscribe({
      next: result => {
        this.operations.set(result);
        this.operationsPeriod.setValue({ from: result.fromInclusive, to: result.toInclusive });
      },
      error: () => this.operationsError.set(true),
    });
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

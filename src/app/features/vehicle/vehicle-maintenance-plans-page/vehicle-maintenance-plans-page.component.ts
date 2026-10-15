import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { MaintenanceScheduleService } from '../../../core/services/maintenance-schedule.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { VehiclePageHeaderComponent } from '../components/vehicle-page-header/vehicle-page-header.component';
import { MaintenanceSchedule } from '../vehicle-maintenance-page/maintenance-schedule.model';
import { MAINTENANCE_TYPES } from '../vehicle-maintenance-page/vehicle-maintenance.model';

@Component({
  selector: 'app-vehicle-maintenance-plans-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule,
    MatSelectModule, VehiclePageHeaderComponent],
  templateUrl: './vehicle-maintenance-plans-page.component.html',
  styleUrl: './vehicle-maintenance-plans-page.component.scss',
})
export class VehicleMaintenancePlansPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly vehicles = inject(VehicleService);
  private readonly schedules = inject(MaintenanceScheduleService);
  private readonly auth = inject(AuthService);

  readonly vehicle = signal<Vehicle | null>(null);
  readonly vehicleError = signal<string | null>(null);
  readonly loadingVehicle = signal(true);
  readonly plans = signal<MaintenanceSchedule[]>([]);
  readonly loadingPlans = signal(false);
  readonly plansError = signal<string | null>(null);
  readonly mutatingId = signal<number | null>(null);
  readonly submitting = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly actionSuccess = signal<string | null>(null);
  readonly types = MAINTENANCE_TYPES;
  readonly canManage = this.auth.isAdmin() || this.auth.hasRole('FLEET_MANAGER');
  readonly availableTypes = computed(() => this.types.filter(type =>
    !this.plans().some(plan => plan.type === type.value)));

  readonly form = new FormGroup({
    type: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    frequencyMileage: new FormControl<number | null>(null, [Validators.min(1), Validators.pattern(/^\d+$/)]),
    frequencyMonths: new FormControl<number | null>(null, [Validators.min(1), Validators.pattern(/^\d+$/)]),
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('vehicleId'));
    if (!Number.isInteger(id) || id <= 0) {
      this.loadingVehicle.set(false);
      this.vehicleError.set('Identifiant du véhicule invalide.');
      return;
    }
    this.vehicles.getById(id).pipe(finalize(() => this.loadingVehicle.set(false))).subscribe({
      next: vehicle => {
        this.vehicle.set(vehicle);
        this.reloadPlans();
      },
      error: () => this.vehicleError.set('Impossible de charger le véhicule.'),
    });
  }

  reloadPlans(): void {
    const vehicle = this.vehicle();
    if (!vehicle) return;
    this.loadingPlans.set(true);
    this.plansError.set(null);
    this.schedules.findByVehicle(vehicle.id)
      .pipe(finalize(() => this.loadingPlans.set(false)))
      .subscribe({
        next: plans => this.plans.set(plans),
        error: () => this.plansError.set('Impossible de charger les plans d’entretien.'),
      });
  }

  createPlan(): void {
    const vehicle = this.vehicle();
    if (!this.canManage || !vehicle || this.submitting()) return;
    this.actionError.set(null);
    this.actionSuccess.set(null);
    const value = this.form.getRawValue();
    if (this.form.invalid || (value.frequencyMileage == null && value.frequencyMonths == null)
      || !this.availableTypes().some(type => type.value === value.type)) {
      this.form.markAllAsTouched();
      this.actionError.set('Choisissez un type disponible et au moins une fréquence entière positive.');
      return;
    }
    this.submitting.set(true);
    this.schedules.create({ vehicleId: vehicle.id, type: value.type,
      frequencyMileage: value.frequencyMileage, frequencyMonths: value.frequencyMonths })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.form.reset({ type: '', frequencyMileage: null, frequencyMonths: null });
          this.actionSuccess.set('Plan créé. Les échéances ont été calculées à partir du dernier entretien connu, s’il existe.');
          this.reloadPlans();
        },
        error: (error: HttpErrorResponse) => this.actionError.set(error.status === 409
          ? 'Un plan existe déjà pour ce type d’entretien.' : 'Impossible de créer le plan.'),
      });
  }

  changeStatus(plan: MaintenanceSchedule): void {
    if (!this.canManage || this.mutatingId() !== null) return;
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.mutatingId.set(plan.id);
    const action = plan.status === 'ACTIVE'
      ? this.schedules.deactivate(plan.id) : this.schedules.activate(plan.id);
    action.pipe(finalize(() => this.mutatingId.set(null))).subscribe({
      next: () => {
        this.actionSuccess.set(plan.status === 'ACTIVE' ? 'Plan désactivé.' : 'Plan réactivé et échéances recalculées.');
        this.reloadPlans();
      },
      error: () => this.actionError.set('Impossible de modifier le statut du plan.'),
    });
  }

  typeLabel(type: string): string {
    return this.types.find(item => item.value === type)?.label ?? type;
  }

  isDue(plan: MaintenanceSchedule): boolean {
    if (plan.status !== 'ACTIVE') return false;
    const mileage = this.vehicle()?.currentMileage;
    const mileageDue = plan.nextDueMileage != null && mileage != null && mileage >= plan.nextDueMileage;
    const today = new Date();
    const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return mileageDue || (plan.nextDueDate != null && plan.nextDueDate <= localToday);
  }
}

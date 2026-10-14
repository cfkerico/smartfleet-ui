import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin, finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { NotificationService } from '../../../core/services/notification.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { VehiclePageHeaderComponent } from '../components/vehicle-page-header/vehicle-page-header.component';
import { MAINTENANCE_TYPES, MaintenanceRevision, VehicleMaintenance, VehicleMileageCorrection } from '../vehicle-maintenance-page/vehicle-maintenance.model';

@Component({
  selector: 'app-correct-maintenance-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, VehiclePageHeaderComponent],
  templateUrl: './correct-maintenance-page.component.html',
  styleUrl: './correct-maintenance-page.component.scss',
})
export class CorrectMaintenancePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(MaintenanceService);
  private readonly vehicles = inject(VehicleService);
  private readonly notification = inject(NotificationService);
  readonly auth = inject(AuthService);
  readonly types = MAINTENANCE_TYPES;
  readonly vehicle = signal<Vehicle | null>(null);
  readonly maintenance = signal<VehicleMaintenance | null>(null);
  readonly revisions = signal<MaintenanceRevision[]>([]);
  readonly mileageCorrections = signal<VehicleMileageCorrection[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly reviewRequired = signal(false);
  readonly mileageError = signal<string | null>(null);
  readonly mileageSubmitting = signal(false);
  readonly maxDate = this.localDate(new Date());
  vehicleId = 0;
  maintenanceId = 0;

  readonly form = new FormGroup({
    type: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    completedDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    mileageAtMaintenance: new FormControl<number | null>(null,
      [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]),
    costAmount: new FormControl<number | null>(null, [Validators.min(0)]),
    reason: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly mileageForm = new FormGroup({
    correctedMileage: new FormControl<number | null>(null,
      [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]),
    reason: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    this.vehicleId = Number(this.route.snapshot.paramMap.get('vehicleId'));
    this.maintenanceId = Number(this.route.snapshot.paramMap.get('maintenanceId'));
    if (!Number.isInteger(this.vehicleId) || this.vehicleId <= 0 ||
        !Number.isInteger(this.maintenanceId) || this.maintenanceId <= 0) {
      this.error.set('Identifiant de véhicule ou d’entretien invalide.');
      this.loading.set(false);
      return;
    }
    this.reload();
  }

  submit(): void {
    if (!this.auth.isAdmin() || this.submitting() || this.form.invalid || !this.maintenance()) {
      this.form.markAllAsTouched();
      return;
    }
    const values = this.form.getRawValue();
    this.submitError.set(null);
    this.submitting.set(true);
    this.service.correct(this.maintenanceId, {
      expectedRevision: this.maintenance()!.revisionNumber,
      type: values.type, completedDate: values.completedDate,
      mileageAtMaintenance: values.mileageAtMaintenance!, costAmount: values.costAmount,
      reason: values.reason.trim(),
    }).pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: result => {
        this.maintenance.set(result.maintenance);
        this.reviewRequired.set(result.mileageReviewRequired);
        this.notification.success('Entretien rectifié avec succès.');
        this.form.controls.reason.reset();
        this.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.submitError.set(error.status === 409
          ? 'Cet entretien a déjà été rectifié. Rechargez la page avant de réessayer.'
          : this.errorMessage(error, 'Impossible de rectifier cet entretien.'));
      },
    });
  }

  correctMileage(): void {
    if (!this.auth.isAdmin() || this.mileageSubmitting() || this.mileageForm.invalid ||
        !this.maintenance() || !this.vehicle()) {
      this.mileageForm.markAllAsTouched();
      return;
    }
    const values = this.mileageForm.getRawValue();
    this.mileageSubmitting.set(true);
    this.mileageError.set(null);
    this.service.correctVehicleMileage(this.vehicleId, this.maintenanceId,
      values.correctedMileage!, values.reason.trim())
      .pipe(finalize(() => this.mileageSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.reviewRequired.set(false);
          this.notification.success('Kilométrage du véhicule rectifié et tracé.');
          this.mileageForm.reset();
          this.reload();
        },
        error: (error: HttpErrorResponse) =>
          this.mileageError.set(this.errorMessage(error, 'Impossible de rectifier le kilométrage.')),
      });
  }

  typeLabel(type: string): string {
    return this.types.find(item => item.value === type)?.label ?? type;
  }

  actorLabel(actorId: string | null | undefined): string {
    if (!actorId?.trim()) return 'Utilisateur inconnu';

    const user = this.auth.getUser();
    if (user?.sub === actorId) {
      const fullName = typeof user['name'] === 'string' ? user['name'].trim() : '';
      const givenName = typeof user['given_name'] === 'string' ? user['given_name'].trim() : '';
      const familyName = typeof user['family_name'] === 'string' ? user['family_name'].trim() : '';
      const username = typeof user['preferred_username'] === 'string' ? user['preferred_username'].trim() : '';
      return fullName || [givenName, familyName].filter(Boolean).join(' ') || username || 'Vous';
    }

    return `Utilisateur · ${actorId.slice(-8)}`;
  }

  private reload(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      vehicle: this.vehicles.getById(this.vehicleId),
      maintenance: this.service.findById(this.maintenanceId),
      revisions: this.service.revisions(this.maintenanceId),
      mileageCorrections: this.service.vehicleMileageCorrections(this.vehicleId),
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: result => {
        if (result.maintenance.vehicleId !== this.vehicleId) {
          this.error.set('Cet entretien ne correspond pas au véhicule demandé.');
          return;
        }
        this.vehicle.set(result.vehicle);
        this.maintenance.set(result.maintenance);
        this.revisions.set(result.revisions);
        this.mileageCorrections.set(result.mileageCorrections);
        this.form.patchValue({
          type: result.maintenance.type, completedDate: result.maintenance.completedDate,
          mileageAtMaintenance: result.maintenance.mileageAtMaintenance,
          costAmount: result.maintenance.costAmount,
        });
        this.mileageForm.controls.correctedMileage.setValue(result.maintenance.mileageAtMaintenance);
      },
      error: () => this.error.set('Impossible de charger le dossier de rectification.'),
    });
  }

  private errorMessage(error: HttpErrorResponse, fallback: string): string {
    return typeof error.error?.message === 'string' && error.error.message
      ? error.error.message : fallback;
  }

  private localDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}

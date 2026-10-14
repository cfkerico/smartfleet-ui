import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { NotificationService } from '../../../core/services/notification.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { VehiclePageHeaderComponent } from '../components/vehicle-page-header/vehicle-page-header.component';
import { MAINTENANCE_TYPES } from '../vehicle-maintenance-page/vehicle-maintenance.model';

@Component({
  selector: 'app-record-maintenance-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule,
    MatSelectModule, VehiclePageHeaderComponent],
  templateUrl: './record-maintenance-page.component.html',
  styleUrl: './record-maintenance-page.component.scss',
})
export class RecordMaintenancePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vehicleService = inject(VehicleService);
  private readonly maintenanceService = inject(MaintenanceService);
  private readonly notification = inject(NotificationService);

  readonly vehicleId = signal<number | null>(null);
  readonly vehicle = signal<Vehicle | null>(null);
  readonly loadingVehicle = signal(true);
  readonly vehicleError = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly maxDate = this.localDate(new Date());

  readonly types = MAINTENANCE_TYPES;

  readonly form = new FormGroup({
    type: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    completedDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, control =>
        control.value && control.value > this.maxDate ? { futureDate: true } : null],
    }),
    mileageAtMaintenance: new FormControl<number | null>(null, [
      Validators.required, Validators.min(0), Validators.pattern(/^\d+$/),
    ]),
    costAmount: new FormControl<number | null>(null, [Validators.min(0)]),
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('vehicleId'));
    if (!Number.isInteger(id) || id <= 0) {
      this.loadingVehicle.set(false);
      this.vehicleError.set('Identifiant du véhicule invalide.');
      return;
    }

    this.vehicleId.set(id);
    this.vehicleService.getById(id)
      .pipe(finalize(() => this.loadingVehicle.set(false)))
      .subscribe({
        next: vehicle => this.vehicle.set(vehicle),
        error: () => this.vehicleError.set('Impossible de charger le véhicule.'),
      });
  }

  submit(): void {
    const vehicleId = this.vehicleId();
    if (this.submitting() || vehicleId === null || !this.vehicle()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError.set(null);
    this.submitting.set(true);
    const values = this.form.getRawValue();
    this.maintenanceService.recordCompleted({
      vehicleId,
      type: values.type,
      completedDate: values.completedDate,
      mileageAtMaintenance: values.mileageAtMaintenance!,
      costAmount: values.costAmount,
    }).pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.notification.success('Entretien enregistré avec succès.');
          void this.router.navigate(['/vehicles', vehicleId, 'maintenances']);
        },
        error: (error: HttpErrorResponse) => {
          this.submitError.set(
            typeof error.error?.message === 'string' && error.error.message
              ? error.error.message
              : 'Impossible d’enregistrer cet entretien. Vérifiez les informations et réessayez.',
          );
        },
      });
  }

  private localDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

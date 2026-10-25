import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { formatDate } from '@angular/common';
import { Driver } from '../../../models/driver.model';
import { Vehicle } from '../../../models/vehicle';
import { AssignmentStatus, AssignmentType, VehicleAssignment } from '../../../models/assignment.model';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface AssignmentFormData {
  mode: 'CREATE' | 'PAUSE' | 'RESUME';
  assignment?: VehicleAssignment;
  preselectedDriver?: Driver;
  preselectedVehicle?: Vehicle;
}

@Component({
  selector: 'app-assignment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, 
    MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatDatepickerModule, 
    MatNativeDateModule, MatIconModule
  ],
  templateUrl: './assignment-form.component.html',
  styleUrl: './assignment-form.component.scss',
})
export class AssignmentFormComponent implements OnInit {

  form!: FormGroup;

  drivers: Driver[] = [];
  vehicles: Vehicle[] = [];
  assignments: VehicleAssignment[] = [];
  private assignableDriverIds = new Set<number>();
  private assignableVehicleIds = new Set<number>();
  private driversLoaded = false;
  private vehiclesLoaded = false;
  private assignmentsLoaded = false;

  assignmentTypes: string[] = [AssignmentType.PRIMARY, AssignmentType.TEMPORARY_REMPLACEMENT, AssignmentType.PROMOTION];

  constructor(private fb: FormBuilder, private assignmentService: AssignmentApiService, private notification: NotificationService,
    private dialogRef: MatDialogRef<AssignmentFormComponent>,
     @Inject(MAT_DIALOG_DATA) public data: AssignmentFormData) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm() {
    const assignment = this.data.assignment;

    this.form = this.fb.group({
      driverId: [this.data.preselectedDriver?.id ?? assignment?.driverId ?? null, Validators.required],
      vehicleId: [this.data.preselectedVehicle?.id ?? assignment?.vehicleId ?? null, Validators.required],
      type: [assignment?.type ?? AssignmentType.PRIMARY, Validators.required],
      startDate: [assignment?.startDate ? new Date(assignment.startDate) : new Date(), Validators.required],
      reason: [assignment?.reason ?? '']

    });

    if (this.data.mode === 'CREATE') {
      this.form.get('type')?.setValue(AssignmentType.PRIMARY);
      if (this.data.preselectedDriver) this.form.get('driverId')?.disable();
      if (this.data.preselectedVehicle) this.form.get('vehicleId')?.disable();
    } else if (this.data.mode === 'PAUSE') {
      this.form.get('reason')?.addValidators(Validators.required);
    }
  }

  private loadData() {
    this.assignmentService.findDrivers().subscribe({
      next: drivers => {
        this.assignableDriverIds = new Set(drivers.map(driver => driver.id));
        const selected = this.data.preselectedDriver;
        this.drivers = selected && !this.assignableDriverIds.has(selected.id)
          ? [selected, ...drivers] : drivers;
        this.driversLoaded = true;
      },
      error: () => this.notification.error('Impossible de charger les chauffeurs disponibles'),
    });

    this.assignmentService.findVehicles().subscribe({
      next: vehicles => {
        this.assignableVehicleIds = new Set(vehicles.map(vehicle => vehicle.id));
        const selected = this.data.preselectedVehicle;
        this.vehicles = selected && !this.assignableVehicleIds.has(selected.id)
          ? [selected, ...vehicles] : vehicles;
        this.vehiclesLoaded = true;
      },
      error: () => this.notification.error('Impossible de charger les véhicules disponibles'),
    });

    this.assignmentService.findAssignments().subscribe({
      next: assignments => {
        this.assignments = assignments;
        this.assignmentsLoaded = true;
      },
      error: () => this.notification.error('Impossible de vérifier les affectations existantes'),
    });
  }

  get availableDrivers(): Driver[] {
    return this.drivers.filter(driver => this.assignableDriverIds.has(driver.id)
      && !this.isDriverAlreadyAssigned(driver.id));
  }

  get availableVehicles(): Vehicle[] {
    return this.vehicles.filter(vehicle => this.assignableVehicleIds.has(vehicle.id)
      && !this.isVehicleAlreadyAssigned(vehicle.id));
  }

  availabilityMessage(): string | null {
    if (this.data.mode !== 'CREATE' || !this.availabilityChecked()) return null;
    const noDrivers = this.availableDrivers.length === 0;
    const noVehicles = this.availableVehicles.length === 0;
    if (noDrivers && noVehicles) return 'Aucun chauffeur ni véhicule disponible : tous sont déjà affectés ou indisponibles.';
    if (noDrivers) return 'Aucun chauffeur disponible : tous sont déjà affectés ou indisponibles.';
    if (noVehicles) return 'Aucun véhicule disponible : tous sont déjà affectés ou indisponibles.';
    return null;
  }

  private availabilityChecked(): boolean {
    return this.driversLoaded && this.vehiclesLoaded && this.assignmentsLoaded;
  }

  contextUnavailable(): boolean {
    if (!this.availabilityChecked()) return false;
    const driverId = this.data.preselectedDriver?.id;
    const vehicleId = this.data.preselectedVehicle?.id;
    return (driverId !== undefined
        && (!this.assignableDriverIds.has(driverId) || this.isDriverAlreadyAssigned(driverId)))
      || (vehicleId !== undefined
        && (!this.assignableVehicleIds.has(vehicleId) || this.isVehicleAlreadyAssigned(vehicleId)));
  }

  canCreateAssignment(): boolean {
    if (this.data.mode !== 'CREATE' || !this.availabilityChecked()) {
      return false;
    }
    const { driverId, vehicleId } = this.form.getRawValue();
    return this.form.valid
      && this.assignableDriverIds.has(driverId)
      && this.assignableVehicleIds.has(vehicleId)
      && !this.isDriverAlreadyAssigned(driverId)
      && !this.isVehicleAlreadyAssigned(vehicleId);
  }

  isDriverAlreadyAssigned(driverId: number): boolean {
    return this.assignments.some(assignment => assignment.driverId === driverId && 
      [AssignmentStatus.ACTIVE.toString(), AssignmentStatus.TEMPORARY_ACTIVE.toString()].includes(assignment.status));
  }

  isVehicleAlreadyAssigned(vehicleId: number): boolean {
    return this.assignments.some(assignment => assignment.vehicleId === vehicleId && 
      [AssignmentStatus.ACTIVE.toString(), AssignmentStatus.TEMPORARY_ACTIVE.toString()].includes(assignment.status));
  }
  
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.data.mode === 'CREATE' && !this.canCreateAssignment()) {
      this.notification.error('Chauffeur ou véhicule indisponible pour une nouvelle affectation');
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      driverId: raw.driverId,
      vehicleId: raw.vehicleId,
      type: raw.type,
      startDate: formatDate(raw.startDate, 'yyyy-MM-dd', 'en-US'),
      reason: raw.reason
    };

    if (this.data.mode === 'CREATE') {
      this.assignmentService.createAssignment(payload).subscribe({
        next: (response) => {
          this.notification.success('Affectation créée avec succès');
          this.dialogRef.close(true);
        },
        error: (error) => {          
          this.notification.error('Impossible de créer l’affectation');
        }
      });
    } else if (this.data.mode === 'PAUSE' && this.data.assignment?.id) {
      this.assignmentService.pausedAssignment(this.data.assignment!.id, payload.reason).subscribe({
        next: (response) => {
          this.notification.success('Affectation suspendue');
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.notification.error('Impossible de suspendre l’affectation');
        }
      });
    } else if (this.data.mode === 'RESUME' && this.data.assignment?.id) {
      this.assignmentService.resumeAssignment(this.data.assignment!.id).subscribe({
        next: (response) => {
          this.notification.success('Affectation reprise');
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.notification.error('Impossible de reprendre l’affectation');
        }
      });
    }
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

}

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Driver } from '../../../models/driver.model';
import { Vehicle } from '../../../models/vehicle';
import { AssignmentStatus, AssignmentType, VehicleAssignment } from '../../../models/assignment.model';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { NotificationService } from '../../../core/services/notification.service';

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

  assignmentTypes: string[] = [AssignmentType.PRIMARY, AssignmentType.TEMPORARY_REMPLACEMENT, AssignmentType.PROMOTION];
  assignmentStatuses: string[] = [AssignmentStatus.ACTIVE, AssignmentStatus.PAUSED, 
    AssignmentStatus.TEMPORARY_ACTIVE, AssignmentStatus.ENDED, AssignmentStatus.CANCELLED];


  constructor(private fb: FormBuilder, private assignmentService: AssignmentApiService, private notification: NotificationService,
    private dialogRef: MatDialogRef<AssignmentFormComponent>,
     @Inject(MAT_DIALOG_DATA) public data: {
      mode: 'CREATE' | 'EDIT' | 'PAUSE' | 'RESUME';
      assignment?: VehicleAssignment;
    }) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm() {
    const assignment = this.data.assignment;

    this.form = this.fb.group({
      driverId: [assignment?.driverId ?? null, Validators.required],
      vehicleId: [assignment?.vehicleId ?? null, Validators.required],
      type: [assignment?.type ?? AssignmentType.PRIMARY, Validators.required],
      status: [assignment?.status ?? AssignmentStatus.ACTIVE, Validators.required],
      startDate: [assignment?.startDate ? new Date(assignment.startDate) : new Date(), Validators.required],
      endDate: [assignment?.endDate ? new Date(assignment.endDate) : null],
      reason: [assignment?.reason ?? '']

    });

    if (this.data.mode === 'CREATE') {
      this.form.get('status')?.disable();
      this.form.get('type')?.setValue(AssignmentType.PRIMARY);
      this.form.get('reason')?.disable();
    }
  }

  private loadData() {
    this.assignmentService.findDrivers().subscribe(drivers => {
      this.drivers = drivers;
    });

    this.assignmentService.findVehicles().subscribe(vehicles => {      
      this.vehicles = vehicles;
    });

    this.assignmentService.findAssignments().subscribe(assignments => {
      this.assignments = assignments;
    });
  }

  isDriverAlreadyAssigned(driverId: number): boolean {
    if(this.data.mode === 'EDIT' && this.data.assignment?.driverId === driverId) {
      return false;
    }
    return this.assignments.some(assignment => assignment.driverId === driverId && 
      [AssignmentStatus.ACTIVE.toString(), AssignmentStatus.TEMPORARY_ACTIVE.toString()].includes(assignment.status));
  }

  isVehicleAlreadyAssigned(vehicleId: number): boolean {
    if(this.data.mode === 'EDIT' && this.data.assignment?.vehicleId === vehicleId) {
      return false;
    }
    return this.assignments.some(assignment => assignment.vehicleId === vehicleId && 
      [AssignmentStatus.ACTIVE.toString(), AssignmentStatus.TEMPORARY_ACTIVE.toString()].includes(assignment.status));
  }
  
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    console.log('************** raw form data : ', raw);

    const payload = {
      driverId: raw.driverId,
      vehicleId: raw.vehicleId,
      type: raw.type,
      status: raw.status,
      startDate: this.toIsoDate(raw.startDate),
      endDate: raw.endDate 
        ? this.toIsoDate(raw.endDate)
        : null,
      reason: this.data.mode === 'PAUSE' ? raw.reason : this.data.assignment?.reason
    };

    if (this.data.mode === 'CREATE') {
      this.assignmentService.createAssignment(payload).subscribe({
        next: (response) => {
          console.log('Assignment created successfully', response);
          this.notification.success('Assignment created successfully');
          this.dialogRef.close(true);
        },
        error: (error) => {          
          console.error('Failed to create assignment', error);
          this.notification.error('Failed to create assignment');
        }
      });
    } else if (this.data.mode === 'PAUSE' && this.data.assignment?.id) {
      this.assignmentService.pausedAssignment(this.data.assignment!.id, payload.reason).subscribe({
        next: (response) => {
          console.log('Assignment paused successfully', response);
          this.notification.success('Assignment paused successfully');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Failed to pause assignment', error);
          this.notification.error('Failed to pause assignment');
        }
      });
    } else if (this.data.mode === 'RESUME' && this.data.assignment?.id) {
      this.assignmentService.resumeAssignment(this.data.assignment!.id).subscribe({
        next: (response) => {
          console.log('Assignment resumed successfully', response);
          this.notification.success('Assignment resumed successfully');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Failed to resume assignment', error);
          this.notification.error('Failed to resume assignment');
        }
      });
    }
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().substring(0, 10);
  }



}

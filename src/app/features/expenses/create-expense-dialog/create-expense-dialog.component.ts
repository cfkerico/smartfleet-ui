import { Component, Inject, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

import { ExpensePriority, ExpenseType } from '../../../models/expense.model';
import { Vehicle } from '../../../models/vehicle';
import { ExpenseApiService } from '../../../core/services/expense-api.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { NotificationService } from '../../../core/services/notification.service';


export interface CreateExpenseDialogData {
  preselectedVehicle?: Vehicle;
}

@Component({
  selector: 'app-create-expense-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatOptionModule],
  templateUrl: './create-expense-dialog.component.html',
  styleUrl: './create-expense-dialog.component.scss',
})
export class CreateExpenseDialogComponent implements OnInit {

  form!: FormGroup;

  vehicles: Vehicle[] = [];
  expenseTypes: ExpenseType[] = ['FUEL', 'MAINTENANCE', 'REPAIR', 'SPARE_PART', 'INSURANCE', 'TAX', 'DOCUMENT', 'SALARY', 'UTILITY', 'OTHER'];
  expensePriorities: ExpensePriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'];

  typeLabel(type: ExpenseType): string {
    const labels: Record<ExpenseType, string> = {
      FUEL: 'Carburant',
      MAINTENANCE: 'Entretien',
      REPAIR: 'Réparation',
      SPARE_PART: 'Pièce détachée',
      INSURANCE: 'Assurance',
      TAX: 'Taxe',
      DOCUMENT: 'Document',
      SALARY: 'Salaire',
      UTILITY: 'Charge',
      OTHER: 'Autre',
    };
    return labels[type];
  }

  priorityLabel(priority: ExpensePriority): string {
    const labels: Record<ExpensePriority, string> = {
      LOW: 'Faible',
      NORMAL: 'Normale',
      HIGH: 'Élevée',
      URGENT: 'Urgente',
      CRITICAL: 'Critique',
    };
    return labels[priority];
  }

  constructor(
    private fb: FormBuilder,
    private expenseApi: ExpenseApiService,
    private vehicleService: VehicleService,
    private notification: NotificationService,
    private dialogRef: MatDialogRef<CreateExpenseDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: CreateExpenseDialogData | null
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadVehicles();
  }

  private initForm(): void {
    this.form = this.fb.group({
      vehicleId: [this.data?.preselectedVehicle?.id ?? null, Validators.required],
      expenseType: [null, Validators.required],
      requestedAmount: [null, [Validators.required, Validators.min(1)]],
      priority: ['NORMAL', Validators.required],      
      description: [null],
    });
    if (this.data?.preselectedVehicle) this.form.get('vehicleId')?.disable();
  }

  private loadVehicles(): void {
    if (this.data?.preselectedVehicle) {
      this.vehicles = [this.data.preselectedVehicle];
      return;
    }
    this.vehicleService.getOptions().subscribe((vehicles) => {
      this.vehicles = vehicles.filter(vehicle => vehicle.vehicleStatus !== 'INACTIVE' && vehicle.vehicleStatus !== 'SOLD');
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (this.data?.preselectedVehicle && raw.vehicleId !== this.data.preselectedVehicle.id) {
      this.form.get('vehicleId')?.setErrors({ vehicleMismatch: true });
      return;
    }
    this.expenseApi.createExpense({
      vehicleId: raw.vehicleId,
      expenseType: raw.expenseType,
      requestedAmount: raw.requestedAmount,
      priority: raw.priority,
      description: raw.description
    }).subscribe(() => {
      this.notification.success('Dépense créée avec succès');
      this.dialogRef.close(true);
    });

  }

  close(): void {
    this.dialogRef.close(false);
  }

}

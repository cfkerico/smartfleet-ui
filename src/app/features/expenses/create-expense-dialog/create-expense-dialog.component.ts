import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

import { ExpensePriority, ExpenseType } from '../../../models/expense.model';
import { Vehicle } from '../../../models/vehicle';
import { ExpenseApiService } from '../../../core/services/expense-api.service';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';


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

  constructor(
    private fb: FormBuilder,
    private expenseApi: ExpenseApiService,
    private assignmentService: AssignmentApiService,
    private dialogRef: MatDialogRef<CreateExpenseDialogComponent>
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadVehicles();
  }

  private initForm(): void {
    this.form = this.fb.group({
      vehicleId: [null, Validators.required],
      expenseType: [null, Validators.required],
      requestedAmount: [null, [Validators.required, Validators.min(0)]],
      priority: ['NORMAL', Validators.required],      
      description: [null],
    });
  }

  private loadVehicles(): void {
    this.assignmentService.findVehicles().subscribe((vehicles) => {
      this.vehicles = vehicles;
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.expenseApi.createExpense({
      vehicleId: raw.vehicleId,
      expenseType: raw.expenseType,
      requestedAmount: raw.requestedAmount,
      priority: raw.priority,
      description: raw.description
    }).subscribe(() => {
      this.dialogRef.close(true);
    });

  }

  close(): void {
    this.dialogRef.close(false);
  }

}

import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ExpenseRequest, PaymentMethod } from '../../../models/expense.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { formatDate } from '@angular/common';


@Component({
  selector: 'app-disburse-expense-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './disburse-expense-dialog.component.html',
  styleUrl: './disburse-expense-dialog.component.scss',
})
export class DisburseExpenseDialogComponent {

  paymentMethods: PaymentMethod[] = [
    'CASH',
    'BANK_TRANSFER',
    'CHECK',
    'MOBILE_MONEY',
    'CARD'
  ];

  private readonly fb = inject(FormBuilder);

  private readonly dialogRef = inject(MatDialogRef<DisburseExpenseDialogComponent>);
  readonly data = inject<{ expense: ExpenseRequest }>(MAT_DIALOG_DATA);


  form = this.fb.group({
    paidAmount: [
      null as number | null,
      [Validators.required, Validators.min(1)]
    ],

    paymentMethod: [null as PaymentMethod | null, Validators.required],

    referenceNumber: [''],
    beneficiary: [''],
    comment: [''],
    paymentDate: [new Date(), Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.dialogRef.close({
      paidAmount: raw.paidAmount,
      paymentMethod: raw.paymentMethod,
      referenceNumber: raw.referenceNumber || null,
      beneficiary: raw.beneficiary || null,
      comment: raw.comment || null,
      paymentDate: this.toIsoInstant(raw.paymentDate!)
    });
  }

  close(): void {
    this.dialogRef.close(null);
  }

  private toIsoInstant(date: Date): string {
    return date.toISOString();
  }
}

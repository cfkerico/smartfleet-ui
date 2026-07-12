import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Inject } from '@angular/core';
import { ExpenseRequest } from '../../../models/expense.model';

@Component({
  selector: 'app-expense-reason-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],

  templateUrl: './expense-reason-dialog.component.html',
  styleUrl: './expense-reason-dialog.component.scss',
})
export class ExpenseReasonDialogComponent {

  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    reason: ['', [Validators.required, Validators.minLength(5)]],
  });

  constructor (private dialogRef: MatDialogRef<ExpenseReasonDialogComponent>, 
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      confirmLabel: string;
      confirmColor: 'primary' | 'warn';
      placeholderMotif: string;
    }
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close({    
      
      reason: this.form.getRawValue().reason
    });
  }

  close(): void {
    this.dialogRef.close(null);
  }



}

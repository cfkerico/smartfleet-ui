import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RevenuePaymentApiService } from '../../../core/services/revenue-payment-api.service';
import { DriverPayment, DriverPaymentCorrection } from '../../../models/payment.model';

@Component({
  selector: 'app-payment-correction-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './payment-correction-dialog.component.html',
  styleUrl: './payment-correction-dialog.component.scss',
})
export class PaymentCorrectionDialogComponent implements OnInit {
  corrections: DriverPaymentCorrection[] = [];
  loading = true;
  submitting = false;
  readonly form;

  constructor(private fb: FormBuilder,
    private payments: RevenuePaymentApiService,
    private notifications: NotificationService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<PaymentCorrectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DriverPayment) {
    this.form = this.fb.group({
      correctedAmount: [this.data.paidAmount, [Validators.required, Validators.min(1)]],
      reason: ['', [Validators.required, Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.payments.getCorrections(this.data.id).subscribe({
      next: history => { this.corrections = history; this.loading = false; },
      error: () => { this.loading = false; this.notifications.error('Impossible de charger les corrections'); },
    });
  }

  submit(): void {
    if (!this.auth.isAdmin() || this.submitting || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.submitting = true;
    this.payments.correctPayment(this.data.id, {
      correctedAmount: Number(raw.correctedAmount),
      reason: raw.reason!.trim(),
    }).subscribe({
      next: () => {
        this.notifications.success('Versement corrigé avec succès');
        this.dialogRef.close(true);
      },
      error: () => {
        this.submitting = false;
        this.notifications.error('Impossible de corriger le versement');
      },
    });
  }

  close(): void { this.dialogRef.close(false); }
}

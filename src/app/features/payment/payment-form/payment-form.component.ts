import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { formatDate } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { RevenuePaymentApiService } from '../../../core/services/revenue-payment-api.service';
import { VehicleAssignment } from '../../../models/assignment.model';

@Component({
  standalone: true,
  selector: 'app-payment-form',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatOptionModule, MatDatepickerModule, MatNativeDateModule, MatIconModule
  ],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
})
export class PaymentFormComponent implements OnInit {

  form!: FormGroup;

  assignments: VehicleAssignment[] = [];

  constructor(private fb: FormBuilder, private notification: NotificationService, 
    private assignmentService: AssignmentApiService, private revenuePaymentApi: RevenuePaymentApiService,
    private dialogRef: MatDialogRef<PaymentFormComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.form = this.fb.group({
      assignmentId: [null, Validators.required],
      paidAmount: [null, Validators.required, Validators.min(1)],
      paymentDate: [new Date(), Validators.required]
    });
  }

  private loadData(): void {
    this.assignmentService.findActiveAssignments().subscribe(assignments => {
      this.assignments = assignments;
    });
    
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    
    const assignment = this.assignments.find(a => a.id === raw.assignmentId);

    if (!assignment) {
      this.notification.error('Selected assignment not found');
      this.form.get('assignmentId')?.setErrors({ assignmentNotFound: true });
      return;
    }

    console.log('---------------- assignments : ', raw.paymentDate);

    const payload = {
      driverId: assignment.driverId,
      vehicleId: assignment.vehicleId,
      paidAmount: raw.paidAmount,
      paymentDate: formatDate(raw.paymentDate, 'yyyy-MM-dd', 'fr')
    };

    console.log('+++++++++++++++++ payload', JSON.stringify(payload));

    this.revenuePaymentApi.createPayment(payload).subscribe(() => {
      this.notification.success('Payment created successfully');
        this.dialogRef.close(true);
    });
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().substring(0, 10);
  }

  savePayment() {
    // Implement the logic to save the payment
  }

  cancel() {
    // Implement the logic to cancel the payment form
  }
}

import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {finalize} from 'rxjs';
import {VehicleService} from '../../../core/services/vehicle.service';
import {NotificationService} from '../../../core/services/notification.service';

export interface AcquisitionPriceDialogData {
  vehicleId: number;
  vehicleLabel: string;
  currentPrice: number | null;
}

@Component({
  selector: 'app-acquisition-price-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatDialogActions,
    MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './acquisition-price-dialog.component.html',
  styleUrl: './acquisition-price-dialog.component.scss',
})
export class AcquisitionPriceDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AcquisitionPriceDialogComponent, boolean>);
  private readonly vehicleService = inject(VehicleService);
  private readonly notification = inject(NotificationService);
  readonly data = inject<AcquisitionPriceDialogData>(MAT_DIALOG_DATA);

  readonly form = new FormGroup({
    correctedPrice: new FormControl<number | null>(this.data.currentPrice,
      [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
    reason: new FormControl('', [Validators.required, Validators.maxLength(2000)]),
  });
  saving = false;

  submit(): void {
    if (this.saving || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const {correctedPrice, reason} = this.form.getRawValue();
    if (!reason?.trim()) {
      this.form.controls.reason.setErrors({required: true});
      return;
    }
    if (correctedPrice == null || correctedPrice === this.data.currentPrice) {
      this.form.controls.correctedPrice.setErrors({unchanged: true});
      return;
    }
    this.saving = true;
    this.vehicleService.correctAcquisitionPrice(this.data.vehicleId, correctedPrice, reason.trim())
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: () => {
          this.notification.success('Prix d’achat corrigé et historisé.');
          this.dialogRef.close(true);
        },
        error: () => this.notification.error('Impossible de corriger le prix d’achat du véhicule.'),
      });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

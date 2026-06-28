import {Component, Inject, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogModule,
  MatDialogTitle
} from '@angular/material/dialog';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatFormField, MatInput} from '@angular/material/input';
import {VehicleListComponent} from '../vehicle-list/vehicle-list.component';
import {MatButton} from '@angular/material/button';
import {Vehicle} from '../../../models/vehicle';

@Component({
  standalone: true,
  selector: 'app-vehicle-form',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatError,
    MatButton,
    MatDialogModule,
    MatDialogActions
  ],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss',
})
export class VehicleFormComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    brand: ['', Validators.required],
    model: ['', Validators.required],
    year: ['', Validators.required],
    fuelType: ['', Validators.required],
    vin: [''],
    registrationNumber: ['', Validators.required],
  });

  isEdit = false;

  constructor(private dialogRef: MatDialogRef<VehicleListComponent>, @Inject(MAT_DIALOG_DATA) public data: Vehicle | null) {
    if (data) {
      this.isEdit = true;

      this.form.patchValue({
        brand: data.brand,
        model: data.model,
        year: data.year,
        fuelType: data.fuelType,
        vin: data.vin,
        registrationNumber: data.registrationNumber
      });
    }
  }

  get f() {
    return this.form.controls;
  }

  save() {
    if(this.form.invalid) return;

    this.dialogRef.close(this.form.value);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}

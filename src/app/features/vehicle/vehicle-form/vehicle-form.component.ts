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
    name: ['', Validators.required],
    marque: ['', Validators.required],
    modele: ['', Validators.required],
    anneeFabrication: ['', Validators.required],
    registration: ['', Validators.required],
  });

  isEdit = false;

  constructor(private dialogRef: MatDialogRef<VehicleListComponent>, @Inject(MAT_DIALOG_DATA) public data: Vehicle | null) {
    if (data) {
      this.isEdit = true;

      this.form.patchValue({
        name: data.name,
        marque: data.marque,
        modele: data.modele,
        anneeFabrication: data.anneeFabrication,
        registration: data.registration
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

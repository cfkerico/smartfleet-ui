import {Component, Inject, inject} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import {Driver} from '../../../models/driver.model';


@Component({
  standalone: true,
  selector: 'app-driver-form.component',
  imports: [CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  templateUrl: './driver-form.component.html',
  styleUrl: './driver-form.component.scss',
})
export class DriverFormComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    civilite : ['', Validators.required],
    nom : ['', [Validators.required, Validators.minLength(2)]],
    prenom : ['', [Validators.required, Validators.minLength(2)]],
    email : ['', [Validators.required, Validators.email]],
    mobilePhoneNumber : ['', Validators.required],
    adresse : '',
    workedDays : [0, Validators.required], 
    licenseNumber: ['', Validators.required]//,
    //licenseExpirationDate: [null, Validators.required],
    //hireDate: [null, Validators.required]
  });

  isEdit = false;


  constructor(private dialogRef: MatDialogRef<DriverFormComponent>, @Inject(MAT_DIALOG_DATA) public data: Driver | null) {
    if (data) {
      this.isEdit = true;

      this.form.patchValue({
        civilite: data.civilite,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        mobilePhoneNumber: data.mobilePhoneNumber,
        adresse: data.adresse,
        workedDays: data.workedDays,
        licenseNumber: data.licenseNumber//,
        //licenseExpirationDate: data.licenseExpirationDate,
        //hireDate: data.hireDate

      });
    }
  }


  get f() {
    return this.form.controls;
  }


  save() {
    if (this.form.invalid) return;

    this.dialogRef.close(this.form.value);

  }

  cancel() {
    this.dialogRef.close(null);
  }
}

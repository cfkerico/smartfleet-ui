import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';


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
    workedDays : [0, Validators.required]
  });


  constructor(private dialogRef: MatDialogRef<DriverFormComponent>) {}

  
  get f() {
    return this.form.controls;
  }
  

  save() {
    if (this.form.invalid) return;

    console.log('--------------------- ',this.form.value.civilite);
    this.dialogRef.close(this.form.value);
      
  }

  cancel() {
    console.log('cancel');
    this.dialogRef.close(null);
  }
}

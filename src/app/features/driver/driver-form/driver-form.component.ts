import {Component, Inject, inject, OnInit} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, Form, FormGroup } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatOptionModule } from '@angular/material/core';
import { MatSelect, MatSelectModule } from '@angular/material/select';

import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Driver } from '../../../models/driver.model';
import { DriverService } from '../../../core/services/driver.service';


@Component({
  standalone: true,
  selector: 'app-driver-form.component',
  imports: [CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatOptionModule,
    MatSelectModule
  ],
  templateUrl: './driver-form.component.html',
  styleUrl: './driver-form.component.scss',
})
export class DriverFormComponent implements OnInit{

  form!: FormGroup;
  drivers: Driver[] = [];

  civilites: string[] = ['Mr', 'Mme', 'Mlle'];
  statuses: string[] = ['ACTIVE', 'SUSPENDED', 'INACTIVE', 'ON_LEAVE','BLOCKED', 'UNAVAILABLE'];

  constructor(private fb: FormBuilder, private DriverService: DriverService, private dialogRef: MatDialogRef<DriverFormComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: {
      mode: 'CREATE' | 'EDIT';
      driver?: Driver;
    }) {}

    ngOnInit(): void {
      this.initForm();
      this.loadData();
    }

  private initForm() {
    const driver = this.data.driver;

    this.form = this.fb.group({
      civilite : [driver?.civilite ?? '', Validators.required],
      nom : [driver?.nom ?? '', [Validators.required, Validators.minLength(2)]],
      prenom : [driver?.prenom ?? '', [Validators.required, Validators.minLength(2)]],
      email : [driver?.email ?? '', [Validators.required, Validators.email]],
      mobilePhoneNumber : [driver?.mobilePhoneNumber ?? '', Validators.required],
      adresse : [driver?.adresse ?? ''],
      workedDays : [driver?.workedDays ?? 0, Validators.required], 
      licenseNumber: [driver?.licenseNumber ?? '', Validators.required],
      licenseExpirationDate: [driver?.licenseExpirationDate ?? null, Validators.required],
      hireDate: [driver?.hireDate ?? null, Validators.required],
      status: [driver?.status ?? 'ACTIVE']
    });
  }

  private loadData() {
    console.log('************** driver data : '); // --- IGNORE ---
    /*this.DriverService.getAll(0, 100).subscribe({
      next: (response) => {
        this.drivers = response.content;
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
      }
    });*/
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload = {
      civilite: raw.civilite,
      nom: raw.nom,
      prenom: raw.prenom,
      email: raw.email,
      mobilePhoneNumber: raw.mobilePhoneNumber,
      adresse: raw.adresse,
      licenseNumber: raw.licenseNumber,
      licenseExpirationDate: this.toIsoDate(raw.licenseExpirationDate),
      hireDate: this.toIsoDate(raw.hireDate),
      status: this.data.mode === 'EDIT' ? raw.status : null,
      workedDays: raw.workedDays
    }

    if (this.data.mode === 'CREATE') {
      this.DriverService.create(payload).subscribe({
        next: (response) => {
          console.log('Driver created successfully:', response);
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error creating driver:', error);
        }
      });
    } else if (this.data.mode === 'EDIT' && this.data.driver?.id) {
      this.DriverService.update(this.data.driver.id, payload).subscribe({
        next: (response) => {
          console.log('Driver updated successfully:', response);
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error updating driver:', error);
        }
      });
    }
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().substring(0, 10);
  }
}

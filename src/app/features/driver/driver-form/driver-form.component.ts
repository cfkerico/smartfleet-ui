import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Driver } from '../../../models/driver.model';

@Component({
  standalone: true,
  selector: 'app-driver-form.component',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
  ],
  templateUrl: './driver-form.component.html',
  styleUrl: './driver-form.component.scss',
})
export class DriverFormComponent implements OnInit {
  form!: FormGroup;
  readonly civilites = ['Mr', 'Mme', 'Mlle'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DriverFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'CREATE' | 'EDIT'; driver?: Driver },
  ) {}

  ngOnInit(): void {
    const driver = this.data.driver;
    this.form = this.fb.group({
      civilite: [driver?.civilite ?? '', Validators.required],
      nom: [driver?.nom ?? '', [Validators.required, Validators.minLength(2)]],
      prenom: [driver?.prenom ?? '', [Validators.required, Validators.minLength(2)]],
      email: [driver?.email ?? '', [Validators.required, Validators.email]],
      mobilePhoneNumber: [driver?.mobilePhoneNumber ?? '', Validators.required],
      adresse: [driver?.adresse ?? ''],
      workedDays: [driver?.workedDays ?? 0, [Validators.required, Validators.min(0), Validators.max(31)]],
      licenseNumber: [driver?.licenseNumber ?? '', Validators.required],
      licenseExpirationDate: [this.parseDate(driver?.licenseExpirationDate), Validators.required],
      hireDate: [this.parseDate(driver?.hireDate), Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.dialogRef.close({
      civilite: raw.civilite,
      nom: raw.nom,
      prenom: raw.prenom,
      email: raw.email,
      mobilePhoneNumber: raw.mobilePhoneNumber,
      adresse: raw.adresse,
      workedDays: raw.workedDays,
      licenseNumber: raw.licenseNumber,
      licenseExpirationDate: formatDate(raw.licenseExpirationDate, 'yyyy-MM-dd', 'fr'),
      hireDate: formatDate(raw.hireDate, 'yyyy-MM-dd', 'fr'),
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private parseDate(value?: string | null): Date | null {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}

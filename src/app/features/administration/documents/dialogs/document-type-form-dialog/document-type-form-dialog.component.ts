import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { DocumentTypeView } from '../../models/document-admin.model';
import { DocumentOwnerType } from '../../../../../shared/models/document-owner-type.model'; 

import { DocumentAdministrationApiService } from '../../services/document-administration-api.service';

interface DocumentTypeDialogData {
  mode: 'CREATE' | 'EDIT';
  ownerType?: DocumentOwnerType;
  documentType?: DocumentTypeView;
}

@Component({
  selector: 'app-document-type-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule
  ],
  templateUrl: './document-type-form-dialog.component.html',
  styleUrl: './document-type-form-dialog.component.scss',
})
export class DocumentTypeFormDialogComponent {

  private readonly fb = inject(FormBuilder);
  private readonly api = inject(DocumentAdministrationApiService);
  private readonly dialogRef = inject(MatDialogRef<DocumentTypeFormDialogComponent>);

  readonly data = inject<DocumentTypeDialogData>(MAT_DIALOG_DATA);



  readonly ownerTypes: DocumentOwnerType[] = [
    'DRIVER',
    'VEHICLE',
    'EXPENSE',
    'MAINTENANCE',
    'COMPANY'
  ];

  readonly form = this.fb.group({
    code: [
      {
        value: this.data.documentType?.code ?? '',
        disabled: this.data.mode === 'EDIT'
      },
      [
        Validators.required,
        Validators.maxLength(100)
      ]      
    ],

    label: [
      this.data.documentType?.label ?? '',
      [
        Validators.required,
        Validators.maxLength(200)
      ]
    ],

    description: [
      this.data.documentType?.description ?? ''
    ],

    applicableOwnerType: [
      {
        value: this.data.documentType?.applicableOwnerType ?? this.data.ownerType ?? 'VEHICLE',
        disabled: this.data.mode === 'EDIT'
      },
      Validators.required
    ]
  });

    submit(): void {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }

      const raw = this.form.getRawValue();

      if (this.data.mode === 'CREATE') {
        this.api.createDocumentType({
          code: raw.code!,
          label: raw.label!,
          description: raw.description || null,
          applicableOwnerType: raw.applicableOwnerType!
        }).subscribe(() => {
          this.dialogRef.close(true);
        });

        return;
      }

      this.api.updateDocumentType(this.data.documentType!.id, 
        {
          label: raw.label!,
          description: raw.description || null
        }
      ).subscribe(() => { this.dialogRef.close(true)});
    }

    close(): void {
      this.dialogRef.close(false);
    }





}

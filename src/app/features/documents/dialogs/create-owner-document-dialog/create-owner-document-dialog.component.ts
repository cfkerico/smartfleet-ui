import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { 
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { finalize } from 'rxjs';

import { DocumentOwnerType } from '../../../../shared/models/document-owner-type.model';
import { CreateDocumentMetadata, DocumentComplianceItem } from '../../models/document.model';
import { DocumentApiService } from '../../services/document-api.service';

export interface CreateOwnerDocumentDialogData {
  ownerType: DocumentOwnerType;
  ownerId: number,
  item: DocumentComplianceItem;
}

@Component({
  selector: 'app-create-owner-document-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './create-owner-document-dialog.component.html',
  styleUrl: './create-owner-document-dialog.component.scss',
})
export class CreateOwnerDocumentDialogComponent {

  readonly data = inject<CreateOwnerDocumentDialogData>(MAT_DIALOG_DATA);

  private readonly dialogRef = inject<MatDialogRef<CreateOwnerDocumentDialogComponent, boolean>>(MatDialogRef);

  private readonly formBuilder = inject(FormBuilder);
  private readonly documentApi = inject(DocumentApiService);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.formBuilder.group({
    title: [this.data.item.documentTypeLabel, [Validators.required, Validators.maxLength(150)]],
    documentNumber: [''],
    issuedDate: [''],
    expirationDate: ['', this.data.item.expirationDate ? [Validators.required] : []],
    comment: [''],
    file: new FormControl<File | null>(null, Validators.required)
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) ?? null;

    this.form.controls.file.setValue(file);
    this.form.controls.file.markAllAsTouched();
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const file = value.file;

    if (file === null) {
      return;
    }

    const metadata: CreateDocumentMetadata = {
      documentTypeId: this.data.item.documentTypeId,
      ownerType: this.data.ownerType,
      ownerId: this.data.ownerId,
      title: value.title!,
      documentNumber: value.documentNumber || undefined,
      issuedDate: value.issuedDate || undefined,
      expirationDate: value.expirationDate || undefined,
      comment: value.comment || undefined,
    };

    this.submitting.set(true);
    this.error.set(null);

    this.documentApi.uploadDocument(metadata, file)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: () => {
          this.error.set(`Impossible d'enregistrer le document.`);
        }
      });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { finalize } from 'rxjs';

import { AddDocumentVersionMetadata, DocumentComplianceItem } from '../../models/document.model';
import { DocumentApiService } from '../../services/document-api.service';

export interface AddDocumentVersionDialogData {
  item: DocumentComplianceItem;
}

@Component({
  selector: 'app-add-document-version-dialog',
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
  templateUrl: './add-document-version-dialog.component.html',
  styleUrl: './add-document-version-dialog.component.scss',
})
export class AddDocumentVersionDialogComponent {

  readonly data = inject<AddDocumentVersionDialogData>(MAT_DIALOG_DATA);

  private readonly dialogRef = inject<MatDialogRef<AddDocumentVersionDialogComponent, boolean>>(MatDialogRef);

  private readonly formBuilder = inject(FormBuilder);
  private readonly documentApi = inject(DocumentApiService);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.formBuilder.group({
    documentNumber: [''],
    issuedDate: [''],
    expirationDate: ['', this.data.item.expirationRequired ? [Validators.required] : []],
    comment: [''],
    file: new FormControl<File | null>(null, Validators.required)
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) ?? null;

    this.form.controls.file.setValue(file);
    this.form.controls.file.markAsTouched();
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const documentId = this.data.item.documentId;
    const value = this.form.getRawValue();
    const file = value.file;

    if (documentId === null || file === null) {
      this.error.set('Le document ou le fichier est invalide.');
      return;
    }

    const metadata: AddDocumentVersionMetadata = {
      documentNumber: value.documentNumber || undefined,
      issuedDate: value.issuedDate || undefined,
      expirationDate: value.expirationDate || undefined,
      comment: value.comment || undefined
    };

    this.submitting.set(true);
    this.error.set(null);

    this.documentApi.addVersion(documentId, metadata, file)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: () => {
          this.error.set(`Impossible d'ajouter la nouvelle version.`);
        }
      });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

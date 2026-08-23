import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { finalize } from 'rxjs';

import { DocumentApiService } from '../../services/document-api.service';

export interface ArchiveDocumentDialogData {
  documentId: number;
  documentTypeLabel: string;
}

@Component({
  selector: 'app-archive-document-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './archive-document-dialog.component.html',
  styleUrl: './archive-document-dialog.component.scss',
})
export class ArchiveDocumentDialogComponent {
  readonly data = inject<ArchiveDocumentDialogData>(MAT_DIALOG_DATA);

  private readonly dialogRef = inject<MatDialogRef<ArchiveDocumentDialogComponent, boolean>>(MatDialogRef);
  private readonly documentApi = inject(DocumentApiService);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = new FormGroup({
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)]
    })
  });

  cancel(): void {
    if (!this.submitting()) {
      this.dialogRef.close(false);
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const reason = this.form.controls.reason.value.trim();

    if (reason.length === 0) {
      this.form.controls.reason.setErrors({ required: true });
      this.form.controls.reason.markAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.documentApi.archive(this.data.documentId, { reason })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => {
          this.error.set(`Impossible d'archiver le document. Veuillez réessayer.`);
        }
      });
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { finalize, forkJoin } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { DocumentDetail, DocumentVersion } from '../../models/document.model';
import { DocumentApiService } from '../../services/document-api.service';
import { ArchiveDocumentDialogComponent, ArchiveDocumentDialogData } from '../archive-document-dialog/archive-document-dialog.component';

export interface DocumentDetailDialogData {
  documentId: number;
  documentTypeLabel: string;
}

@Component({
  selector: 'app-document-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './document-detail-dialog.component.html',
  styleUrl: './document-detail-dialog.component.scss',
})
export class DocumentDetailDialogComponent implements OnInit {

  readonly data = inject<DocumentDetailDialogData>(MAT_DIALOG_DATA);

  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject<MatDialogRef<DocumentDetailDialogComponent, boolean>>(MatDialogRef);

  private readonly documentApi = inject(DocumentApiService);
  private readonly notification = inject(NotificationService);

  readonly detail = signal<DocumentDetail | null>(null);
  readonly versions = signal<DocumentVersion[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly downloadingVersionId = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      detail: this.documentApi.findDetail(this.data.documentId),
      versions: this.documentApi.findVersions(this.data.documentId)
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: result => {
          this.detail.set(result.detail);
          this.versions.set(result.versions);
        },
        error: () => {
          this.detail.set(null);
          this.versions.set([]);
          this.error.set('Impossible de charger le document.');
        },
      });
  }

  download(version: DocumentVersion): void {
    if (this.downloadingVersionId() !== null) {
      return;
    }

    this.downloadingVersionId.set(version.versionId);

    this.documentApi.downloadVersion(this.data.documentId, version.versionId)
      .pipe(finalize(() => this.downloadingVersionId.set(null)))
      .subscribe({
        next: response => {
          if (response.body === null) {
            this.notification.error('Le fichier téléchargé est vide.');
            return;
          }

          const fileName = this.extractFileName(response.headers.get('Content-Disposition')) ?? version.originalFileName;

          this.saveFile(response.body, fileName);
        },
        error: () => {
          this.notification.error('Impossible de télécharger le fichier.');
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  archiveDocument(): void {
    const documentDetail = this.detail();

    if (documentDetail === null || documentDetail.status === 'ARCHIVED') {
      return;
    }

    const dialogData: ArchiveDocumentDialogData = {
      documentId: documentDetail.documentId,
      documentTypeLabel: documentDetail.documentTypeLabel
    };

    this.dialog.open<ArchiveDocumentDialogComponent, ArchiveDocumentDialogData, boolean>(ArchiveDocumentDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      disableClose: true,
      data: dialogData
      }
    )
    .afterClosed()
    .subscribe(archived => {
      if (archived === true) {
        this.dialogRef.close(true);
      }
    });
  }

  private saveFile(content: Blob, fileName: string): void {
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  private extractFileName(contentDisposition: string | null): string | null {
    if (contentDisposition === null) {
      return null;
    }

    const utf8Match = contentDisposition.match( /filename\*=UTF-8''([^;]+)/i);

    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1]);
    }

    const regularMatch = contentDisposition.match(/filename="?([^";]+)"?/i);

    return regularMatch?.[1] ?? null;
  }
}

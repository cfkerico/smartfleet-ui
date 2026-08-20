import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, signal } from '@angular/core';
import { 
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { 
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { DocumentOwnerType } from '../../../../shared/models/document-owner-type.model';
import {
  DocumentStatus,
  DocumentSummary,
} from '../../models/document.model';
import { DocumentApiService } from '../../services/document-api.service';

export interface OwnerDocumentListDialogData {
  ownerType: DocumentOwnerType;
  ownerId: number;
  ownerDisplayName: string;
}

@Component({
  selector: 'app-owner-document-list-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './owner-document-list-dialog.component.html',
  styleUrl: './owner-document-list-dialog.component.scss',
})
export class OwnerDocumentListDialogComponent implements OnInit {

  readonly displayedColumns = [
    'documentType',
    'title',
    'documentNumber',
    'version',
    'expirationDate',
    'status',
    'actions'
  ];

  readonly documents = signal<DocumentSummary[]>([]);
  readonly loading = signal(false);
  readonly totalDocuments = signal(0);

  pageIndex = 0;
  pageSize = 10;
  

  status?: DocumentStatus;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    readonly data: OwnerDocumentListDialogData,
    private readonly dialogRef: MatDialogRef<OwnerDocumentListDialogComponent>,
    private readonly documentApi: DocumentApiService,
    private readonly notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading.set(true);

    this.documentApi.findByOwner({
      ownerType: this.data.ownerType,
      ownerId: this.data.ownerId,
      status: this.status,
      page: this.pageIndex,
      size: this.pageSize
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: response => {
        this.documents.set(response.content);
        this.totalDocuments.set(response.totalElements);
      },
      error:() => {
        this.notification.error('Impossible de charger les documents.');
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDocuments();
  }

  close(): void {
    this.dialogRef.close();
  }

  statusLabel(status: DocumentStatus): string {
    const labels: Record<DocumentStatus, string> = {
      'DRAFT': 'Brouillon',
      'VALID': 'Valide',
      'EXPIRED': 'Expiré',
      'REJECTED': 'Rejeté',
      'ARCHIVED': 'Archivé'
    }
    
    return labels[status];
  }
  






}

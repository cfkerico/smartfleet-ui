import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../core/services/notification.service';
import { DocumentComplianceItem, DocumentSummary } from '../../documents/models/document.model';
import { OwnerDocumentComplianceComponent } from '../../documents/components/owner-document-compliance/owner-document-compliance.component';
import { CreateOwnerDocumentDialogComponent, CreateOwnerDocumentDialogData } from '../../documents/dialogs/create-owner-document-dialog/create-owner-document-dialog.component';
import { AddDocumentVersionDialogComponent, AddDocumentVersionDialogData } from '../../documents/dialogs/add-document-version-dialog/add-document-version-dialog.component';
import { DocumentDetailDialogComponent, DocumentDetailDialogData } from '../../documents/dialogs/document-detail-dialog/document-detail-dialog.component';
import { OwnerArchivedDocumentListComponent } from '../../documents/components/owner-archived-document-list/owner-archived-document-list.component';

import { DriverService } from '../../../core/services/driver.service';
import { Driver } from '../../../models/driver.model';

import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-driver-document-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    OwnerDocumentComplianceComponent,
    OwnerArchivedDocumentListComponent
  ],
  templateUrl: './driver-document-page.component.html',
  styleUrl: './driver-document-page.component.scss',
})
export class DriverDocumentPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly driverService = inject(DriverService);

  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);
  private readonly complianceComponent = viewChild(OwnerDocumentComplianceComponent);

  private readonly archivedDocumentListComponent = viewChild(OwnerArchivedDocumentListComponent);

  readonly driverId = signal<number | null>(null);
  readonly driver = signal<Driver | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const rawDriverId = this.route.snapshot.paramMap.get('driverId');
    const driverId = Number(rawDriverId);

    if (!Number.isSafeInteger(driverId) || driverId <= 0) {
      this.loading.set(false);
      this.error.set('Identifiant du chauffeur invalide.');
      return;
    }

    this.driverId.set(driverId);
    this.loadDriver(driverId);
  }

  private loadDriver(driverId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.driverService.getById(driverId)
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe({
      next: driver => {
        this.driver.set(driver);
      },
      error: () => {
        this.driver.set(null);
        this.error.set('Impossible de charger les informations du chauffeur.');
      },
    });
  }

  addDocument(item: DocumentComplianceItem): void {
    const ownerId = this.driverId();

    if (ownerId === null) {
      return;
    }

    const data: CreateOwnerDocumentDialogData = {
      ownerType: 'DRIVER',
      ownerId,
      item
    };

    const dialogRef = this.dialog.open<CreateOwnerDocumentDialogComponent, CreateOwnerDocumentDialogData, boolean>(CreateOwnerDocumentDialogComponent, {
      width: '720px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      data
    });

    dialogRef.afterClosed().subscribe(created => {
      if (created !== true) {
        return;
      }

      this.notification.success('Document ajouté avec succès.');
      this.complianceComponent()?.reload();
    });

  }

  replaceDocument(item: DocumentComplianceItem): void {
    if (item.documentId === null) {
      this.notification.error('Aucun document ne peut être remplacé.');
      return;
    }

    const data: AddDocumentVersionDialogData = { item };

    const dialogRef = this.dialog.open<AddDocumentVersionDialogComponent, AddDocumentVersionDialogData, boolean>(AddDocumentVersionDialogComponent, {
      width: '720px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      data
    });

    dialogRef.afterClosed().subscribe(created => {
      if (created !== true) {
        return;
      }

      this.notification.success('Nouvelle version ajoutée avec succès.');
      this.complianceComponent()?.reload();
    });
  }

  viewDocument(item: DocumentComplianceItem): void {
    if (item.documentId === null) {
      this.notification.error('Aucun document ne peut être consulté.');
      return;
    }

    this.openDocumentDetail(item.documentId, item.documentTypeLabel);
  }

  viewArchivedDocument(document: DocumentSummary): void {
    this.openDocumentDetail(document.documentId, document.documentTypeLabel);
  }

  private openDocumentDetail(documentId: number, documentTypeLabel: string): void {
    const data: DocumentDetailDialogData = {
      documentId,
      documentTypeLabel
    };

    const dialogRef = this.dialog.open<DocumentDetailDialogComponent, DocumentDetailDialogData, boolean>(DocumentDetailDialogComponent, {
      width: '1000px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      data
    });

    dialogRef.afterClosed().subscribe(archived => {
      if (archived !== true) {
        return;
      }

      this.notification.success('Document archivé avec succès.');
      this.complianceComponent()?.reload();
      this.archivedDocumentListComponent()?.reload();
    });
  }


}

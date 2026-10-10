import { Component, OnInit, signal, inject, viewChild } from '@angular/core';
import { finalize } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { CompanyApiService } from '../../../core/services/company-api-service';
import { NotificationService } from '../../../core/services/notification.service';
import { CompanyView } from '../../../models/company.model';

import { OwnerDocumentComplianceComponent } from '../../documents/components/owner-document-compliance/owner-document-compliance.component';
import { DocumentComplianceItem } from '../../documents/models/document.model';
import { CreateOwnerDocumentDialogComponent, CreateOwnerDocumentDialogData } from '../../documents/dialogs/create-owner-document-dialog/create-owner-document-dialog.component';
import { AddDocumentVersionDialogComponent, AddDocumentVersionDialogData } from '../../documents/dialogs/add-document-version-dialog/add-document-version-dialog.component';
import { DocumentDetailDialogComponent, DocumentDetailDialogData } from '../../documents/dialogs/document-detail-dialog/document-detail-dialog.component';
import { OwnerArchivedDocumentListComponent } from '../../documents/components/owner-archived-document-list/owner-archived-document-list.component';
import { DocumentSummary } from '../../documents/models/document.model';

@Component({
  selector: 'app-company-document-page',
  standalone: true,
  imports: [
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    RouterLink,
    OwnerDocumentComplianceComponent,
    OwnerArchivedDocumentListComponent
  ],
  templateUrl: './company-document-page.component.html',
  styleUrl: './company-document-page.component.scss',
})
export class CompanyDocumentPageComponent implements OnInit {

  private readonly companyApiService = inject(CompanyApiService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);
  private readonly complianceComponent = viewChild(OwnerDocumentComplianceComponent);
  private readonly archivedDocumentListComponent = viewChild(OwnerArchivedDocumentListComponent);

  readonly company = signal<CompanyView | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);



  ngOnInit(): void {
    this.loadMyCompany();
  }

  private loadMyCompany(): void {
    this.loading.set(true);
    this.error.set(null);

    this.companyApiService.findMyCompany()
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe({
      next: company => {
        this.company.set(company);
      },
      error: () => {
        console.error('Error getting my company:');
        this.company.set(null);
        this.error.set('Impossible de charger la société de l\'utilisateur.');
      }
    });
  }

  addDocument(item: DocumentComplianceItem): void {
    const ownerId = this.company()?.id;
    if (ownerId == null) {
      return;
    }

    const data: CreateOwnerDocumentDialogData = {
      ownerType: 'COMPANY',
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
    if (item.documentId == null) {
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

      this.notification.success('Nouvelle version du document ajoutée avec succès.');
      this.complianceComponent()?.reload();
    });
  }

  viewDocument(item: DocumentComplianceItem): void {
    if (item.documentId == null) {
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

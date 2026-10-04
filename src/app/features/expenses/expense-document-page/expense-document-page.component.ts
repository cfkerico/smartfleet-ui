import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { ExpenseDetailView } from '../../../models/expense.model';
import { ExpenseApiService } from '../../../core/services/expense-api.service';
import { OwnerDocumentComplianceComponent } from '../../documents/components/owner-document-compliance/owner-document-compliance.component';
import { OwnerArchivedDocumentListComponent } from '../../documents/components/owner-archived-document-list/owner-archived-document-list.component';
import { DocumentComplianceItem, DocumentSummary } from '../../documents/models/document.model';
import { CreateOwnerDocumentDialogComponent, CreateOwnerDocumentDialogData } from '../../documents/dialogs/create-owner-document-dialog/create-owner-document-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';
import { DocumentDetailDialogComponent, DocumentDetailDialogData } from '../../documents/dialogs/document-detail-dialog/document-detail-dialog.component';
import { AddDocumentVersionDialogComponent, AddDocumentVersionDialogData } from '../../documents/dialogs/add-document-version-dialog/add-document-version-dialog.component';

@Component({
  selector: 'app-expense-document-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    OwnerDocumentComplianceComponent,
    OwnerArchivedDocumentListComponent
],
  templateUrl: './expense-document-page.component.html',
  styleUrl: './expense-document-page.component.scss',
})
export class ExpenseDocumentPageComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly expenseApi = inject(ExpenseApiService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);
  private readonly complianceComponent = viewChild(OwnerDocumentComplianceComponent);
  private readonly archivedDocumentListComponent = viewChild(OwnerArchivedDocumentListComponent);


  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly expenseId = signal<number | null>(null);
  
  readonly expenseDetail = signal<ExpenseDetailView | null>(null);

  ngOnInit(): void {

    const rawExpenseId = this.route.snapshot.paramMap.get('id');
    const expenseId = Number(rawExpenseId);

    if (!Number.isSafeInteger(expenseId) || expenseId <= 0) {
      this.loading.set(false);
      this.error.set('Identifiant de la dépense invalide.');
      return;
    }

    this.expenseId.set(expenseId);
    this.loadExpense(expenseId);

  }

  private loadExpense(expenseId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.expenseApi.findExpenseDetail(expenseId)
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe({
      next: detail => {
        this.expenseDetail.set(detail);
      },
      error: () => {
        this.expenseId.set(null);
        this.error.set('Impossible de charger les informations liées à la dépense.');
      }
    });
  }

  addDocument(item: DocumentComplianceItem): void {
    const ownerId = this.expenseId();

    if (ownerId === null) {
      return;
    }

    const data: CreateOwnerDocumentDialogData = {
      ownerType: 'EXPENSE',
      ownerId,
      item
    };

    const dialogRef = this.dialog.open<CreateOwnerDocumentDialogComponent, CreateOwnerDocumentDialogData, boolean>(CreateOwnerDocumentDialogComponent, {
      width: '720px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      data: data
    });

    dialogRef.afterClosed().subscribe(created => {
      if (created !== true) {
        return;
      }

      this.notification.success('Document ajouté avec succès.');
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

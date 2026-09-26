import { CommonModule } from '@angular/common';
import { Component, input, output, signal, inject, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DocumentOwnerType } from '../../../../shared/models/document-owner-type.model';
import { DocumentSummary } from '../../models/document.model';

import { finalize } from 'rxjs';
import { DocumentApiService } from '../../services/document-api.service';

@Component({
  selector: 'app-owner-archived-document-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './owner-archived-document-list.component.html',
  styleUrl: './owner-archived-document-list.component.scss',
})
export class OwnerArchivedDocumentListComponent implements OnInit {

  readonly ownerType = input.required<DocumentOwnerType>();
  readonly ownerId = input.required<number>();

  readonly viewRequested = output<DocumentSummary>();

  readonly documents = signal<DocumentSummary[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly page = signal(0);
  readonly pageSize = signal(10);
  readonly totalElements = signal(0);

  private readonly documentApi = inject(DocumentApiService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.documentApi.findByOwner({
      ownerType: this.ownerType(),
      ownerId: this.ownerId(),
      status: 'ARCHIVED',
      page: this.page(),
      size: this.pageSize()
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: result => {
          this.documents.set(result.content);
          this.totalElements.set(result.totalElements);
        },
        error: () => {
          this.documents.set([]);
          this.totalElements.set(0);
          this.error.set('Impossible de charger les documents archivés.');
        }
      });
  }

  view(document: DocumentSummary): void {
    this.viewRequested.emit(document);
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  reload(): void {
    this.page.set(0);
    this.load();
  }
}

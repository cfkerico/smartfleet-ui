import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';

import { DocumentOwnerType, DocumentTypeView } from '../../models/document-admin.model';

import { DocumentAdministrationApiService } from '../../services/document-administration-api.service';
import { DocumentTypeFormDialogComponent } from '../../dialogs/document-type-form-dialog/document-type-form-dialog.component';


@Component({
  selector: 'app-document-type-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    MatTableModule
  ],
  templateUrl: './document-type-list.component.html',
  styleUrl: './document-type-list.component.scss',
})
export class DocumentTypeListComponent implements OnInit {

  readonly ownerTypes: DocumentOwnerType[] = [
    'DRIVER',
    'VEHICLE',
    'EXPENSE',
    'MAINTENANCE',
    'COMPANY'
  ];

  readonly ownerTypeControl = new FormControl<DocumentOwnerType>('VEHICLE', { nonNullable: true });

  readonly displayedColumns = [
    'code',
    'label',
    'ownerType',
    'systemType',
    'active',
    'updatedAt',
    'actions'
  ];

  readonly dataSource = new MatTableDataSource<DocumentTypeView>([]);

  constructor(private readonly api: DocumentAdministrationApiService, private readonly dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadDocumentTypes();

    this.ownerTypeControl.valueChanges.subscribe(() => {
      this.loadDocumentTypes();
    });
  }

  loadDocumentTypes(): void {
    this.api.findDocumentTypes(this.ownerTypeControl.value).subscribe(types => {      
      this.dataSource.data = types;
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(
      DocumentTypeFormDialogComponent, 
      {
        width: '650px',
        data: {
          mode: 'CREATE',
          ownerType: this.ownerTypeControl.value
        }        
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadDocumentTypes();
      }
    });
  }

  openEditDialog(documentType: DocumentTypeView): void {
    const dialogRef = this.dialog.open(
      DocumentTypeFormDialogComponent,
      {
        width: '650px',
        data: {
          mode: 'EDIT',
          documentType
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadDocumentTypes();
      }
    });
  }

}

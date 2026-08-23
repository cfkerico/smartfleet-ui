import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../core/services/notification.service';
import { DocumentComplianceItem } from '../../documents/models/document.model';
import { CreateOwnerDocumentDialogComponent, CreateOwnerDocumentDialogData } from '../../documents/dialogs/create-owner-document-dialog/create-owner-document-dialog.component';
import { DocumentDetailDialogComponent, DocumentDetailDialogData } from '../../documents/dialogs/document-detail-dialog/document-detail-dialog.component';

import { finalize } from 'rxjs';

import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { OwnerDocumentComplianceComponent } from '../../documents/components/owner-document-compliance/owner-document-compliance.component';
import { AddDocumentVersionDialogComponent, AddDocumentVersionDialogData } from '../../documents/dialogs/add-document-version-dialog/add-document-version-dialog.component';

@Component({
  selector: 'app-vehicle-document-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    OwnerDocumentComplianceComponent
  ],
  templateUrl: './vehicle-document-page.component.html',
  styleUrl: './vehicle-document-page.component.scss',
})
export class VehicleDocumentPageComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly vehicleService = inject(VehicleService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);
  private readonly complianceComponent = viewChild(OwnerDocumentComplianceComponent)

  readonly vehicleId = signal<number | null>(null);
  readonly vehicle = signal<Vehicle | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const rawVehicleId = this.route.snapshot.paramMap.get('vehicleId');

    const vehicleId = Number(rawVehicleId);

    if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
      this.loading.set(false);
      this.error.set('Identifiant du véhicule invalide.');
      return;
    }

    this.vehicleId.set(vehicleId);
    this.loadVehicle(vehicleId);
  }

  private loadVehicle(vehicleId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.vehicleService.getById(vehicleId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: vehicle => {
          this.vehicle.set(vehicle);
        },
        error: () => {
          this.vehicle.set(null);
          this.error.set('Impossible de charger les informations du véhicule.');
        },
      });
  }

  addDocument(item: DocumentComplianceItem): void {
    const ownerId = this.vehicleId();

    if (ownerId === null) {
      return;
    }

    const data: CreateOwnerDocumentDialogData = {
      ownerType: 'VEHICLE',
      ownerId,
      item
    };

    const dialogRef = this.dialog.open(CreateOwnerDocumentDialogComponent,
      {
        width: '720px',
        maxWidth: '96vw',
        maxHeight: '92vh',
        data
      }
    );

    dialogRef.afterClosed().subscribe(created => {
      if (!created) {
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

    const data: AddDocumentVersionDialogData = { 
      item
    };

    const dialogRef = this.dialog.open(AddDocumentVersionDialogComponent, 
      {
        width: '720px',
        maxWidth: '96vw',
        maxHeight: '92vh',
        data
      }
    );

    dialogRef.afterClosed().subscribe(created => {
      if (!created) {
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

    const data: DocumentDetailDialogData = {
      documentId: item.documentId,
      documentTypeLabel: item.documentTypeLabel
    };

    this.dialog.open(DocumentDetailDialogComponent,
      {
        width: '1000px',
        maxWidth: '96vw',
        maxHeight: '92vh',
        data,
      }
    );
  }


}

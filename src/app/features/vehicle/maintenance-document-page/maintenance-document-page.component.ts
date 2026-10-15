import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, forkJoin } from 'rxjs';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { NotificationService } from '../../../core/services/notification.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { OwnerArchivedDocumentListComponent } from '../../documents/components/owner-archived-document-list/owner-archived-document-list.component';
import { OwnerDocumentComplianceComponent } from '../../documents/components/owner-document-compliance/owner-document-compliance.component';
import { AddDocumentVersionDialogComponent, AddDocumentVersionDialogData } from '../../documents/dialogs/add-document-version-dialog/add-document-version-dialog.component';
import { CreateOwnerDocumentDialogComponent, CreateOwnerDocumentDialogData } from '../../documents/dialogs/create-owner-document-dialog/create-owner-document-dialog.component';
import { DocumentDetailDialogComponent, DocumentDetailDialogData } from '../../documents/dialogs/document-detail-dialog/document-detail-dialog.component';
import { DocumentComplianceItem, DocumentSummary } from '../../documents/models/document.model';
import { VehiclePageHeaderComponent } from '../components/vehicle-page-header/vehicle-page-header.component';
import { MAINTENANCE_TYPES, VehicleMaintenance } from '../vehicle-maintenance-page/vehicle-maintenance.model';

@Component({
  selector: 'app-maintenance-document-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    OwnerDocumentComplianceComponent, OwnerArchivedDocumentListComponent, VehiclePageHeaderComponent],
  templateUrl: './maintenance-document-page.component.html',
  styleUrl: './maintenance-document-page.component.scss',
})
export class MaintenanceDocumentPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly vehicles = inject(VehicleService);
  private readonly maintenances = inject(MaintenanceService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);
  private readonly compliance = viewChild(OwnerDocumentComplianceComponent);
  private readonly archives = viewChild(OwnerArchivedDocumentListComponent);

  readonly vehicle = signal<Vehicle | null>(null);
  readonly maintenance = signal<VehicleMaintenance | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  vehicleId = 0;
  maintenanceId = 0;

  ngOnInit(): void {
    this.vehicleId = Number(this.route.snapshot.paramMap.get('vehicleId'));
    this.maintenanceId = Number(this.route.snapshot.paramMap.get('maintenanceId'));
    if (!Number.isSafeInteger(this.vehicleId) || this.vehicleId <= 0 ||
        !Number.isSafeInteger(this.maintenanceId) || this.maintenanceId <= 0) {
      this.loading.set(false);
      this.error.set('Identifiant du véhicule ou de l’entretien invalide.');
      return;
    }

    forkJoin({
      vehicle: this.vehicles.getById(this.vehicleId),
      maintenance: this.maintenances.findById(this.maintenanceId),
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: ({ vehicle, maintenance }) => {
        if (maintenance.vehicleId !== vehicle.id) {
          this.error.set('Cet entretien ne correspond pas au véhicule demandé.');
          return;
        }
        this.vehicle.set(vehicle);
        this.maintenance.set(maintenance);
      },
      error: () => this.error.set('Impossible de charger le dossier de cet entretien.'),
    });
  }

  typeLabel(type: string): string {
    return MAINTENANCE_TYPES.find(item => item.value === type)?.label ?? type;
  }

  addDocument(item: DocumentComplianceItem): void {
    if (!this.maintenance()) return;
    const data: CreateOwnerDocumentDialogData = {
      ownerType: 'MAINTENANCE', ownerId: this.maintenanceId, item,
    };
    this.dialog.open<CreateOwnerDocumentDialogComponent, CreateOwnerDocumentDialogData, boolean>(
      CreateOwnerDocumentDialogComponent, {
        width: '720px', maxWidth: '96vw', maxHeight: '92vh', data,
      }).afterClosed().subscribe(created => {
        if (created !== true) return;
        this.notification.success('Document ajouté avec succès.');
        this.compliance()?.reload();
      });
  }

  replaceDocument(item: DocumentComplianceItem): void {
    if (item.documentId === null) {
      this.notification.error('Aucun document ne peut être remplacé.');
      return;
    }
    const data: AddDocumentVersionDialogData = { item };
    this.dialog.open<AddDocumentVersionDialogComponent, AddDocumentVersionDialogData, boolean>(
      AddDocumentVersionDialogComponent, {
        width: '720px', maxWidth: '96vw', maxHeight: '92vh', data,
      }).afterClosed().subscribe(created => {
        if (created !== true) return;
        this.notification.success('Nouvelle version ajoutée avec succès.');
        this.compliance()?.reload();
      });
  }

  viewDocument(item: DocumentComplianceItem): void {
    if (item.documentId === null) {
      this.notification.error('Aucun document ne peut être consulté.');
      return;
    }
    this.openDetail(item.documentId, item.documentTypeLabel);
  }

  viewArchivedDocument(document: DocumentSummary): void {
    this.openDetail(document.documentId, document.documentTypeLabel);
  }

  private openDetail(documentId: number, documentTypeLabel: string): void {
    const data: DocumentDetailDialogData = { documentId, documentTypeLabel };
    this.dialog.open<DocumentDetailDialogComponent, DocumentDetailDialogData, boolean>(
      DocumentDetailDialogComponent, {
        width: '1000px', maxWidth: '96vw', maxHeight: '92vh', data,
      }).afterClosed().subscribe(archived => {
        if (archived !== true) return;
        this.notification.success('Document archivé avec succès.');
        this.compliance()?.reload();
        this.archives()?.reload();
      });
  }
}

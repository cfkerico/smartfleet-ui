import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { VehicleMaintenance } from './vehicle-maintenance.model';
import { VehiclePageHeaderComponent } from '../components/vehicle-page-header/vehicle-page-header.component';

@Component({
  selector: 'app-vehicle-maintenance-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatTableModule, VehiclePageHeaderComponent],
  templateUrl: './vehicle-maintenance-page.component.html',
  styleUrl: './vehicle-maintenance-page.component.scss',
})
export class VehicleMaintenancePageComponent implements OnInit {
  private readonly typeLabels: Record<string, string> = {
    OIL_CHANGE: 'Vidange',
    TIRE_CHANGE: 'Changement de pneus',
    BRAKE_CHECK: 'Contrôle des freins',
    ENGINE_REPAIR: 'Réparation moteur',
    TECHNICAL_INSPECTION: 'Contrôle technique',
    GENERAL_SERVICE: 'Entretien général',
    OTHER: 'Autre',
  };
  private readonly statusLabels: Record<string, string> = {
    SCHEDULED: 'Planifiée',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Terminée',
    CANCELLED: 'Annulée',
  };
  private readonly route = inject(ActivatedRoute);
  private readonly vehicleService = inject(VehicleService);
  private readonly maintenanceService = inject(MaintenanceService);

  readonly vehicle = signal<Vehicle | null>(null);
  readonly vehicleError = signal<string | null>(null);
  readonly loadingVehicle = signal(true);
  readonly loadingHistory = signal(false);
  readonly historyError = signal<string | null>(null);
  readonly maintenances = signal<VehicleMaintenance[]>([]);
  readonly totalElements = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly columns = ['completedDate', 'type', 'mileage', 'cost', 'status'];

  private vehicleId: number | null = null;

  ngOnInit(): void {
    const vehicleId = Number(this.route.snapshot.paramMap.get('vehicleId'));
    if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
      this.loadingVehicle.set(false);
      this.vehicleError.set('Identifiant du véhicule invalide.');
      return;
    }

    this.vehicleId = vehicleId;
    this.vehicleService.getById(vehicleId)
      .pipe(finalize(() => this.loadingVehicle.set(false)))
      .subscribe({
        next: vehicle => {
          this.vehicle.set(vehicle);
          this.loadHistory();
        },
        error: () => this.vehicleError.set('Impossible de charger le véhicule.'),
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadHistory();
  }

  retryHistory(): void {
    this.loadHistory();
  }

  typeLabel(type: string): string {
    return this.typeLabels[type] ?? type;
  }

  statusLabel(status: string): string {
    return this.statusLabels[status] ?? status;
  }

  private loadHistory(): void {
    if (this.vehicleId === null) return;
    this.loadingHistory.set(true);
    this.historyError.set(null);
    this.maintenanceService.findByVehicle(this.vehicleId, this.pageIndex(), this.pageSize())
      .pipe(finalize(() => this.loadingHistory.set(false)))
      .subscribe({
        next: result => {
          this.maintenances.set(result.content);
          this.totalElements.set(result.totalElements);
        },
        error: () => {
          this.maintenances.set([]);
          this.historyError.set('Impossible de charger l’historique des entretiens.');
        },
      });
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { VehiclePageHeaderComponent } from '../components/vehicle-page-header/vehicle-page-header.component';

@Component({
  selector: 'app-vehicle-detail-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, VehiclePageHeaderComponent],
  templateUrl: './vehicle-detail-page.component.html',
  styleUrl: '../../shared/entity-detail-page.scss',
})
export class VehicleDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly vehicleService = inject(VehicleService);

  readonly vehicle = signal<Vehicle | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const vehicleId = Number(this.route.snapshot.paramMap.get('vehicleId'));
    if (!Number.isSafeInteger(vehicleId) || vehicleId <= 0) {
      this.loading.set(false);
      this.error.set('Identifiant du véhicule invalide.');
      return;
    }

    this.vehicleService.getById(vehicleId).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: vehicle => this.vehicle.set(vehicle),
      error: () => this.error.set('Impossible de charger ce véhicule.'),
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      AVAILABLE: 'Disponible', ASSIGNED: 'Affecté', MAINTENANCE: 'En entretien',
      BLOCKED: 'Bloqué', SUSPENDED: 'Suspendu', SOLD: 'Vendu',
      INACTIVE: 'Inactif', INVALID: 'Invalide',
    };
    return labels[status] ?? status;
  }
}

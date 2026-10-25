import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AssignmentFormComponent, AssignmentFormData } from '../../assignment/assignment-form/assignment-form.component';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { PaymentFormComponent, PaymentFormData } from '../../payment/payment-form/payment-form.component';
import { CreateExpenseDialogComponent, CreateExpenseDialogData } from '../../expenses/create-expense-dialog/create-expense-dialog.component';
import { VehicleAssignment } from '../../../models/assignment.model';
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
  private readonly assignmentService = inject(AssignmentApiService);
  private readonly dialog = inject(MatDialog);

  readonly vehicle = signal<Vehicle | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeAssignments = signal<VehicleAssignment[]>([]);

  ngOnInit(): void {
    const vehicleId = Number(this.route.snapshot.paramMap.get('vehicleId'));
    if (!Number.isSafeInteger(vehicleId) || vehicleId <= 0) {
      this.loading.set(false);
      this.error.set('Identifiant du véhicule invalide.');
      return;
    }

    this.loadVehicle(vehicleId);
  }

  openAssignment(): void {
    const vehicle = this.vehicle();
    if (!vehicle || vehicle.vehicleStatus !== 'AVAILABLE') return;

    const data: AssignmentFormData = { mode: 'CREATE', preselectedVehicle: vehicle };
    this.dialog.open<AssignmentFormComponent, AssignmentFormData, boolean>(AssignmentFormComponent, {
      width: '800px', maxWidth: '96vw', maxHeight: '90vh', data,
    }).afterClosed().subscribe(created => {
      if (created === true) this.loadVehicle(vehicle.id);
    });
  }

  openExpense(): void {
    const vehicle = this.vehicle();
    if (!vehicle || vehicle.vehicleStatus === 'INACTIVE' || vehicle.vehicleStatus === 'SOLD') return;

    const data: CreateExpenseDialogData = { preselectedVehicle: vehicle };
    this.dialog.open<CreateExpenseDialogComponent, CreateExpenseDialogData, boolean>(CreateExpenseDialogComponent, {
      width: '680px', maxWidth: '96vw', maxHeight: '90vh', data,
    });
  }

  openPayment(): void {
    const vehicle = this.vehicle();
    if (!vehicle || vehicle.vehicleStatus === 'INACTIVE' || this.activeAssignments().length === 0) return;

    const data: PaymentFormData = { vehicleId: vehicle.id };
    this.dialog.open<PaymentFormComponent, PaymentFormData, boolean>(PaymentFormComponent, {
      width: '720px', maxWidth: '96vw', maxHeight: '90vh', data,
    });
  }

  private loadActiveAssignments(vehicleId: number): void {
    this.activeAssignments.set([]);
    this.assignmentService.findActiveAssignments().subscribe({
      next: assignments => this.activeAssignments.set(assignments.filter(a => a.vehicleId === vehicleId)),
      error: () => this.activeAssignments.set([]),
    });
  }

  private loadVehicle(vehicleId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.vehicleService.getById(vehicleId).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: vehicle => {
        this.vehicle.set(vehicle);
        if (vehicle.vehicleStatus !== 'INACTIVE') this.loadActiveAssignments(vehicle.id);
        else this.activeAssignments.set([]);
      },
      error: () => {
        this.vehicle.set(null);
        this.error.set('Impossible de charger ce véhicule.');
      },
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

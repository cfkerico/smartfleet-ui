import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AssignmentFormComponent, AssignmentFormData } from '../../assignment/assignment-form/assignment-form.component';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { PaymentFormComponent, PaymentFormData } from '../../payment/payment-form/payment-form.component';
import { VehicleAssignment } from '../../../models/assignment.model';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DriverService } from '../../../core/services/driver.service';
import { Driver } from '../../../models/driver.model';

@Component({
  selector: 'app-driver-detail-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './driver-detail-page.component.html',
  styleUrl: '../../shared/entity-detail-page.scss',
})
export class DriverDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly driverService = inject(DriverService);
  private readonly assignmentService = inject(AssignmentApiService);
  private readonly dialog = inject(MatDialog);

  readonly driver = signal<Driver | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeAssignments = signal<VehicleAssignment[]>([]);
  readonly assignmentsLoaded = signal(false);
  readonly assignmentsError = signal(false);

  ngOnInit(): void {
    const driverId = Number(this.route.snapshot.paramMap.get('driverId'));
    if (!Number.isSafeInteger(driverId) || driverId <= 0) {
      this.loading.set(false);
      this.error.set('Identifiant du chauffeur invalide.');
      return;
    }

    this.loadDriver(driverId);
  }

  openAssignment(): void {
    const driver = this.driver();
    if (!driver || driver.status !== 'ACTIVE') return;

    const data: AssignmentFormData = { mode: 'CREATE', preselectedDriver: driver };
    this.dialog.open<AssignmentFormComponent, AssignmentFormData, boolean>(AssignmentFormComponent, {
      width: '800px', maxWidth: '96vw', maxHeight: '90vh', data,
    }).afterClosed().subscribe(created => {
      if (created === true) this.loadDriver(driver.id);
    });
  }

  openPayment(): void {
    const driver = this.driver();
    if (!driver || driver.status !== 'ACTIVE' || this.activeAssignments().length === 0) return;

    const data: PaymentFormData = { driverId: driver.id };
    this.dialog.open<PaymentFormComponent, PaymentFormData, boolean>(PaymentFormComponent, {
      width: '720px', maxWidth: '96vw', maxHeight: '90vh', data,
    }).afterClosed().subscribe(created => {
      if (created === true) this.loadDriver(driver.id);
    });
  }

  private loadActiveAssignments(driverId: number): void {
    this.activeAssignments.set([]);
    this.assignmentsLoaded.set(false);
    this.assignmentsError.set(false);
    this.assignmentService.findActiveAssignments().subscribe({
      next: assignments => {
        this.activeAssignments.set(assignments.filter(a => a.driverId === driverId));
        this.assignmentsLoaded.set(true);
      },
      error: () => {
        this.assignmentsError.set(true);
        this.assignmentsLoaded.set(true);
      },
    });
  }

  private loadDriver(driverId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.driverService.getById(driverId).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: driver => {
        this.driver.set(driver);
        if (driver.status === 'ACTIVE') this.loadActiveAssignments(driver.id);
        else {
          this.activeAssignments.set([]);
          this.assignmentsLoaded.set(true);
          this.assignmentsError.set(false);
        }
      },
      error: () => {
        this.driver.set(null);
        this.error.set('Impossible de charger ce chauffeur.');
      },
    });
  }
}

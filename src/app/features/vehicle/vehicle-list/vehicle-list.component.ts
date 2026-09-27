import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Component, OnInit } from '@angular/core';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { VehicleFormComponent } from '../vehicle-form/vehicle-form.component';
import { NotificationService } from '../../../core/services/notification.service';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-vehicle-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatTooltipModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatIcon,
  ],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss',
})
export class VehicleListComponent implements OnInit {
  vehicles = new MatTableDataSource<Vehicle>([]);
  columns = ['name', 'marque', 'modele', 'anneeFabrication', 'registration', 'actions'];
  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;

  constructor(
    private vehicleService: VehicleService,
    private dialog: MatDialog,
    private notification: NotificationService,
  ) {}

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.vehicles.filter = value.trim().toLowerCase();
  }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.vehicleService.getAll(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.vehicles.data = response.content;
        this.totalElements = response.totalElements;
      },
      error: () => {
        console.error('Error loading Vehicles');
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this.load();
  }

  openForm() {
    const dialogRef = this.dialog.open(VehicleFormComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.vehicleService.create(result).subscribe({
          next: () => {
            this.notification.success('Véhicule créé avec succès ✅');
            this.load();
          },
          error: () => {
            this.notification.error('Erreur lors de la création ❌');
          },
        });
      }
    });
  }

  edit(vehicle: Vehicle) {
    const dialogRef = this.dialog.open(VehicleFormComponent, {
      data: vehicle,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && vehicle.id !== undefined) {
        this.vehicleService.update(vehicle.id, result).subscribe({
          next: () => {
            this.notification.success('Véhicule modifié avec succès ✅');
            this.load();
          },
          error: () => {
            this.notification.error('Erreur lors de la modification ❌');
          },
        });
      }
    });
  }

  delete(vehicle: Vehicle) {
    if (vehicle.id !== undefined) {
      this.vehicleService.delete(vehicle.id).subscribe({
        next: () => {
          this.notification.success('Véhicule supprimé avec succès ✅');
          this.load();
        },
        error: () => {
          this.notification.error('Erreur lors de la modification ❌');
        },
      });
    }
  }
}

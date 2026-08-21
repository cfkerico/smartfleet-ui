import {AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import {MatTableDataSource, MatTableModule } from '@angular/material/table';
import {MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ChangeDetectorRef } from '@angular/core';
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
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule, MatFormField, MatInput, MatLabel, MatIcon
  ],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss',
})
export class VehicleListComponent implements OnInit, AfterViewInit {

  vehicles = new MatTableDataSource<Vehicle>([]);
  columns = ['name', 'marque', 'modele', 'anneeFabrication', 'registration', 'actions'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;

  constructor(private vehicleService: VehicleService, private cdr: ChangeDetectorRef,
              private dialog: MatDialog, private notification: NotificationService) { }

  ngAfterViewInit(): void {
        this.vehicles.paginator = this.paginator;
    }

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
      }
      /*data => {
      this.vehicles.data = data;
      console.log('-------------- ', JSON.stringify(data));
      this.cdr.detectChanges();*/
    });
  }

  onPageChange(event:PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this.load();
  }

  openForm() {
    const dialogRef = this.dialog.open(VehicleFormComponent);

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.vehicleService.create(result).subscribe({
          next: () => {
            this.notification.success('Driver créé avec succès ✅');
            this.load();
          },
          error: () => {
            this.notification.error('Erreur lors de la création ❌');
          }
        });
      }
    });
  }

  edit(vehicle: Vehicle) {
    const dialogRef = this.dialog.open(VehicleFormComponent, {
      data: vehicle
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && vehicle.id !== undefined) {
        this.vehicleService.update(vehicle.id, result).subscribe({
          next: () => {
            this.notification.success('Vehicle modifié avec succès ✅');
            this.load();
          },
          error: ()=> {
            this.notification.error('Erreur lors de la modification ❌');
          }
        });
      }
    });
  }

  delete(vehicle: Vehicle) {
    if (vehicle.id !== undefined) {
      this.vehicleService.delete(vehicle.id).subscribe({
        next: () => {
          this.notification.success('Vehicle supprimé avec succès ✅');
          this.load();
        },
        error: () => {
          this.notification.error('Erreur lors de la modification ❌');
        }
      });
    }
  }




}

import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Component, OnInit } from '@angular/core';
import { DriverService } from '../../core/services/driver.service';
import { Driver } from '../../models/driver.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DriverFormComponent } from './driver-form/driver-form.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../../core/services/notification.service';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { DriverAnalysis } from '../../models/driver-analysis.model';
import { AnalyseIaComponent } from '../analyse-ia/analyse-ia.component';

@Component({
  standalone: true,
  selector: 'app-driver-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatTooltipModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatLabel,
    MatFormField,
    MatInput,
    MatIcon,
  ],
  templateUrl: './driver-list.component.html',
  styleUrl: './driver-list.component.scss',
})
export class DriverListComponent implements OnInit {
  drivers = new MatTableDataSource<Driver>([]);
  columns = [
    'civilite',
    'nom',
    'prenom',
    'email',
    'mobilePhoneNumber',
    'adresse',
    'workedDays',
    'actions',
  ];
  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;
  analysis?: DriverAnalysis;

  constructor(
    private driverService: DriverService,
    private dialog: MatDialog,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.driverService.getAll(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        console.log(
          '++++++++++++++++ ------------- +++++++++++++',
          JSON.stringify(response.content),
        );
        this.drivers.data = response.content;
        this.totalElements = response.totalElements;
      },

      error: () => {
        console.error('Error getting page');
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this.load();
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.drivers.filter = value.trim().toLowerCase();
  }

  openForm() {
    const dialogRef = this.dialog.open(DriverFormComponent, {
      width: '800px',
      data: {
        mode: 'CREATE',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.driverService.create(result).subscribe({
          next: () => {
            this.notification.success('Chauffeur créé avec succès ✅');
            this.load();
          },
          error: () => {
            this.notification.error('Erreur lors de la création ❌');
          },
        });
      }
    });
  }

  edit(driver: Driver) {
    console.log(driver);
    const dialogRef = this.dialog.open(DriverFormComponent, {
      width: '800px',
      data: {
        mode: 'EDIT',
        driver: driver,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && driver.id !== undefined) {
        this.driverService.update(driver.id, result).subscribe({
          next: () => {
            this.notification.success('Chauffeur modifié avec succès ✅');
            this.load();
          },
          error: () => {
            this.notification.error('Erreur lors de la modification ❌');
          },
        });
      }
    });
  }

  delete(driver: Driver) {
    console.log(driver);
    if (driver.id !== undefined) {
      this.driverService.delete(driver.id).subscribe({
        next: () => {
          this.notification.success('Chauffeur supprimé avec succès ✅');
          this.load();
        },
        error: () => {
          this.notification.error('Erreur lors de la modification ❌');
        },
      });
    }
  }

  analyse(id: number) {
    this.driverService.analyse(id).subscribe({
      next: (response) => {
        console.log('++++++++++++++++ ------------- +++++++++++++', response);
        this.analysis = response;
        this.dialog.open(AnalyseIaComponent, {
          width: '500px',
          data: response,
        });
      },
      error: () => {
        console.error('Error getting analyse id', id);
      },
    });
  }
}

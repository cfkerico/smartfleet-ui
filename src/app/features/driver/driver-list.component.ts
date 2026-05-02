import { Component, OnInit } from '@angular/core';
import { DriverService } from '../../core/services/driver.service';
import { Driver } from '../../models/driver.model';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DriverFormComponent } from './driver-form/driver-form.component';
import { ChangeDetectorRef } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  standalone: true,
  selector: 'app-driver-list',
  imports: [CommonModule, MatButtonModule, MatTableModule, MatProgressSpinnerModule, 
    MatSnackBarModule],
  templateUrl: './driver-list.component.html',
  styleUrl: './driver-list.component.scss',
})
export class DriverListComponent implements OnInit {
  drivers: Driver[] = [];
  columns = ['civilite', 'nom', 'prenom', 'email', 'mobilePhoneNumber', 'adresse', 'workedDays'];

  constructor (private driverService : DriverService, private dialog: MatDialog, 
    private cdr: ChangeDetectorRef, private notification: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.driverService.getAll().subscribe(data => {
      this.drivers = data;
      this.cdr.detectChanges();
    });
  }

  openForm() {
    const dialogRef = this.dialog.open(DriverFormComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.driverService.create(result).subscribe({
          next: () => {
            this.notification.success('Driver créé avec succès ✅');
            this.load();
          },
          error: () => {
            this.notification.error('Erreur lors de la création ❌');
          }

        });
      }
    })

  }
}

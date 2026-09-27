import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { VehicleAssignment } from '../../../models/vehicle-assignment.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AssignmentFormComponent } from '../assignment-form/assignment-form.component';

@Component({
  selector: 'app-assignment-list',
  standalone: true,
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
  templateUrl: './assignment-list.component.html',
  styleUrl: './assignment-list.component.scss',
})
export class AssignmentListComponent implements OnInit {
  assigments = new MatTableDataSource<VehicleAssignment>([]);
  displayedColumns = [
    'driver',
    'vehicle',
    'type',
    'status',
    'startDate',
    'endDate',
    'reason',
    'actions',
  ];

  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;

  constructor(
    private assignmentService: AssignmentApiService,
    private dialog: MatDialog,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.assignmentService.getAll(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.assigments.data = response.content;
        this.totalElements = response.totalElements;
      },
      error: () => {
        console.error('Failed to load assignments');
        this.notification.error('Failed to load assignments');
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.assigments.filter = filterValue.trim().toLowerCase();
  }

  openForm(): void {
    const dialogRef = this.dialog.open(AssignmentFormComponent, {
      width: '800px',
      data: {
        mode: 'CREATE',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.load();
      }
    });
  }

  pauseAssignment(assignment: VehicleAssignment): void {
    const dialogRef = this.dialog.open(AssignmentFormComponent, {
      width: '800px',
      data: {
        mode: 'PAUSE',
        assignment: assignment,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.load();
      }
    });
  }

  resumeAssignment(assignment: VehicleAssignment): void {
    const dialogRef = this.dialog.open(AssignmentFormComponent, {
      width: '800px',
      data: {
        mode: 'RESUME',
        assignment: assignment,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.load();
      }
    });
  }

  deleteAssignment(assignment: VehicleAssignment) {
    if (
      confirm(
        `Are you sure you want to delete the assignment for driver ${assignment.driverFullName} and vehicle ${assignment.vehicleLabel}?`,
      )
    ) {
      this.assignmentService.deleteAssignment(assignment.id).subscribe({
        next: () => {
          this.notification.success('Assignment deleted successfully');
          this.load(); // Reload the assignments after deletion
        },
        error: () => {
          this.notification.error('Failed to delete assignment');
        },
      });
    }
  }
}

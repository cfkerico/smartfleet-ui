import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { DriverPayment } from '../../models/payment.model';
import { RevenuePaymentApiService } from '../../core/services/revenue-payment-api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';

import { AssignmentApiService } from '../../core/services/assignment-api.service';
import { Driver } from '../../models/driver.model';
import { Vehicle } from '../../models/vehicle';

import { formatDate } from '@angular/common';


@Component({
  standalone: true,
  selector: 'app-payment-history',
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatLabel,
    MatFormField,
    MatInput,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatOptionModule
  ],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.scss',
})
export class PaymentHistoryComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'paymentDate', 'driver', 'vehicle', 'expectedAmount', 'paidAmount', 'differenceAmount', 'status'];

  dataSource = new MatTableDataSource<DriverPayment>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  filterForm!: FormGroup;
  drivers: Driver[] = [];
  vehicles: Vehicle[] = [];


  constructor(private revenuePaymentApi: RevenuePaymentApiService, private dialog: MatDialog, 
    private fb: FormBuilder, private assignmentService: AssignmentApiService
  ) {}

  ngOnInit(): void {    
    this.initFilterForm();
    this.loadFiltersData();
    this.loadPayments(this.pageIndex, this.pageSize);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadPayments(page: number, size: number): void {

    const raw = this.filterForm?.getRawValue();
    console.log('----++++++++----- Raw Filter Form:', raw);

    const filters = {
      driverId: raw?.driverId ?? null,
      vehicleId: raw?.vehicleId ?? null,
      startDate: raw?.startDate ? formatDate(raw.startDate, 'yyyy-MM-dd', 'fr') : null,
      endDate: raw?.endDate ? formatDate(raw.endDate, 'yyyy-MM-dd', 'fr') : null
    };

    this.revenuePaymentApi.findPayments(page, size, filters)
      .subscribe(result => {
        this.dataSource.data = result.content;
        this.totalElements = result.totalElements;
        this.pageIndex = result.page;
        this.pageSize = result.size;
      });
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      driverId: [null],
      vehicleId: [null],
      startDate: [null],
      endDate: [null]
    });
  }

  private loadFiltersData(): void {
    this.assignmentService.findDrivers().subscribe(drivers => {
      this.drivers = drivers;
    });

    this.assignmentService.findVehicles().subscribe(vehicles => {      
      this.vehicles = vehicles;
    });
  }

  onPageChange(event: PageEvent): void {
    this.loadPayments(event.pageIndex, event.pageSize);
  }

  applyFilters(): void {
    this.pageIndex = 0; 
    this.loadPayments(0, this.pageSize);

    //const filterValue = (event.target as HTMLInputElement).value;
    //this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.pageIndex = 0;
    this.loadPayments(0, this.pageSize);
  }

  openForm(): void {
    const dialogRef = this.dialog.open(PaymentFormComponent, {
      width: '1000px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPayments(this.pageIndex, this.pageSize);
      }
    });
  }

  getTotalPaid(): number {
    return this.dataSource.data.reduce((total, payment) => total + payment.paidAmount, 0);
  }

  getTotalExpected(): number {
    return this.dataSource.data.reduce((total, payment) => total + payment.expectedAmount, 0);
  }

  getTotalDifference(): number {
    return this.dataSource.data.reduce((total, payment) => total + payment.differenceAmount, 0);
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getDifferenceClass(value: number): string {
    if (value < 0) {
      return 'negative';
    }

    if (value > 0) {
      return 'positive';
    }

    return 'neutral';
  }
}

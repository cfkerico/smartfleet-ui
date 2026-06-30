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
    MatIcon,
    MatDialogModule
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


  constructor(private revenuePaymentApi: RevenuePaymentApiService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadPayments(this.pageIndex, this.pageSize);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadPayments(page: number, size: number): void {
    this.revenuePaymentApi.findPayments(page, size)
      .subscribe(result => {
        this.dataSource.data = result.content;
        this.totalElements = result.totalElements;
      });
  }

  onPageChange(event: PageEvent): void {
    this.loadPayments(event.pageIndex, event.pageSize);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    /* if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    } */
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

}

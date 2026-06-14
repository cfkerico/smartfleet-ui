import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { DriverPayment } from '../../models/payment.model';
import { RevenuePaymentApiService } from '../../core/services/revenue-payment-api.service';

@Component({
  standalone: true,
  selector: 'app-payment-history',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule
  ],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.scss',
})
export class PaymentHistoryComponent implements AfterViewInit {

  displayedColumns: string[] = [
    'paymentDate',
    'driver',
    'vehicle',
    'expectedAmount',
    'paidAmount',
    'differenceAmount',
    'status'
  ];

  dataSource = new MatTableDataSource<DriverPayment>([]);

  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(private revenuePaymentApi: RevenuePaymentApiService) {}

  ngAfterViewInit(): void {
    this.loadPayments(this.pageIndex, this.pageSize);
  }

  loadPayments(page: number, size: number): void {
    this.revenuePaymentApi.findPayments(page, size)
      .subscribe(result => {
        this.dataSource.data = result.content;
        this.totalElements = result.totalElements;
        this.pageIndex = result.page;
        this.pageSize = result.size;
      });
  }

  onPageChange(event: PageEvent): void {
    this.loadPayments(event.pageIndex, event.pageSize);
  }

}

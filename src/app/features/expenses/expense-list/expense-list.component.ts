import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import  { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { ExpensePriority, ExpenseRequest, ExpenseStatus, ExpenseType } from '../../../models/expense.model';
import { Vehicle } from '../../../models/vehicle';
import { ExpenseApiService } from '../../../core/services/expense-api.service';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { Router } from "@angular/router";
import { CreateExpenseDialogComponent } from '../create-expense-dialog/create-expense-dialog.component';
import { RejectExpenseDialogComponent } from '../reject-expense-dialog/reject-expense-dialog.component';
import { DisburseExpenseDialogComponent } from '../disburse-expense-dialog/disburse-expense-dialog.component';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule
],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss',
})
export class ExpenseListComponent implements OnInit {

  filterForm!: FormGroup;

  vehicles: Vehicle[] = [];

  expenseTypes: ExpenseType[] = ['FUEL', 'MAINTENANCE', 'REPAIR', 'SPARE_PART', 'INSURANCE', 'TAX', 'DOCUMENT', 'SALARY', 'UTILITY', 'OTHER'];

  expensePriorities: ExpensePriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'];

  statuses: ExpenseStatus[] = ['REQUESTED', 'APPROVED', 'PARTIALLY_DISBURSED', 'DISBURSED', 'REJECTED', 'CANCELLED'];

  displayedColumns: string[] = ['vehicle', 'type', 'amount', 'priority', 'status', 'createdAt', 'actions'];

  dataSource = new MatTableDataSource<ExpenseRequest>([]);

  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(private fb: FormBuilder,private expenseApi: ExpenseApiService, private assignmentApi: AssignmentApiService,
     private dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    this.initFilters();
    this.loadVehicles();
    this.loadExpenses(0, this.pageSize);
  }

  private initFilters(): void {
    this.filterForm = this.fb.group({
      vehicleId: [null],
      expenseType: [null],
      status: [null],
      priority: [null]
    });
  }

  private loadVehicles(): void {
    this.assignmentApi.findVehicles().subscribe(
      vehicles => {
        this.vehicles = vehicles;
      });
  }

  loadExpenses(page: number, size: number): void {
    const raw = this.filterForm.getRawValue();
    console.log('----++++++++----- filterForm.getRawValue():', this.filterForm.getRawValue());
    console.log('----++++++++----- Raw Filter Form:', raw);
    this.expenseApi.findExpenses(page, size, {
      vehicleId: raw.vehicleId,
      expenseType: raw.expenseType,
      status: raw.status,
      priority: raw.priority
    }).subscribe(result => {
      this.dataSource.data = result.content;
      this.totalElements = result.totalElements;
      this.pageIndex = page;
      this.pageSize = size;
    });
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadExpenses(0, this.pageSize);
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.pageIndex = 0;
    this.loadExpenses(0, this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.loadExpenses(event.pageIndex, event.pageSize);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateExpenseDialogComponent, {
      width: '680px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadExpenses(this.pageIndex, this.pageSize);
      }
    });
  }

  approve(expense: ExpenseRequest): void {
    this.expenseApi.approveExpense(expense.id).subscribe(() => {
      this.loadExpenses(this.pageIndex, this.pageSize);
    });
  }

  reject(expense: ExpenseRequest): void {
    const dialogRef = this.dialog.open(
      RejectExpenseDialogComponent,
      {
        width: '520px',
        data: {
          expense
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (!result?.reason) {
        return;
      }
      this.expenseApi.rejectExpense(expense.id, result.reason).subscribe(() => {
        this.loadExpenses(this.pageIndex, this.pageSize);
      });
    });
  }

  disburse(expense: ExpenseRequest): void {
    const dialogRef = this.dialog.open(
      DisburseExpenseDialogComponent, {
        width: '680px',
        data: {
          expense
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.expenseApi.disburseExpense(expense.id, result).subscribe(() => {
        this.loadExpenses(this.pageIndex, this.pageSize);
      });
    });
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  openDetail(expense: ExpenseRequest): void {
    this.router.navigate(['/expenses', expense.id]);
  }



}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ChangeDetectorRef } from '@angular/core';

import { ExpenseDetailView, ExpenseRequest } from '../../../models/expense.model';
import { ExpenseApiService } from '../../../core/services/expense-api.service';
import { DisburseExpenseDialogComponent } from '../disburse-expense-dialog/disburse-expense-dialog.component';
import { RejectExpenseDialogComponent } from '../reject-expense-dialog/reject-expense-dialog.component';
import { CdkOverlayOrigin } from "@angular/cdk/overlay";

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatDialogModule
],
  templateUrl: './expense-detail.component.html',
  styleUrl: './expense-detail.component.scss',
})
export class ExpenseDetailComponent implements OnInit {

  expenseDetail?: ExpenseDetailView;
  expenseId!: number;

  displayedDisbursementColumns = [
    'paymentDate',
    'paidAmount',
    'paymentMethod',
    'beneficiary',
    'referenceNumber',
    'createdBy',
    'comment'
  ];


  constructor(private route: ActivatedRoute, private router: Router, private expenseApi: ExpenseApiService, private cdr: ChangeDetectorRef, private dialog: MatDialog) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || Number.isNaN(id)) {
      this.router.navigate(['/expenses']);
      return;
    }
    this.expenseId = id;
    this.loadExpense(id);
  }

  loadExpense(id: number): void {
    //this.loading = true;

    this.expenseApi.findExpenseDetail(id).subscribe({next: detail => {
      this.expenseDetail = detail;
      this.cdr.markForCheck();
    },
    error: error => {
      console.error('Erreur chargement dépense', error)
      }
    });
  }

  backToList(): void {
    this.router.navigate(['/expenses']);
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  get request(): ExpenseRequest | undefined {
    return this.expenseDetail?.request;
  }

  approve(): void {
    if (!this.request) {
      return;
    }

    this.expenseApi.approveExpense(this.request.id).subscribe(() => {
      this.loadExpense(this.request!.id);
    });
  }

  reject(): void {
    if (!this.request) {
      return;
    }

    const dialogRef = this.dialog.open(RejectExpenseDialogComponent, 
      {
        width:'520px',
        data: {
          expense: this.request
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (!result?.reason) {
        return;
      }

      this.expenseApi.rejectExpense(this.request!.id, result.reason).subscribe(() => { this.loadExpense(this.request!.id);        
      });
    });
  }

  disburse(): void {
    if (!this.request) {
      return;
    }

    const dialogRef = this.dialog.open(DisburseExpenseDialogComponent, 
      {
        width: '680px',
        data: {
          expense: this.request
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.expenseApi.disburseExpense(this.request!.id, result).subscribe(() => {
        this.loadExpense(this.request!.id);
      });
    });
  }



}

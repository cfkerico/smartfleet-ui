import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';

import { ChangeDetectorRef } from '@angular/core';

import { ExpenseDetailView, ExpenseRequest } from '../../../models/expense.model';
import { ExpenseApiService } from '../../../core/services/expense-api.service';

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
    MatTableModule
  ],
  templateUrl: './expense-detail.component.html',
  styleUrl: './expense-detail.component.scss',
})
export class ExpenseDetailComponent implements OnInit {

  expenseDetail?: ExpenseDetailView;

  displayedDisbursementColumns = [
    'paymentDate',
    'paidAmount',
    'paymentMethod',
    'beneficiary',
    'referenceNumber',
    'createdBy',
    'comment'
  ];

  //loading = false;

  constructor(private route: ActivatedRoute, private router: Router, private expenseApi: ExpenseApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || Number.isNaN(id)) {
      this.router.navigate(['/expenses']);
      return;
    }

    this.loadExpense(id);
  }

  private loadExpense(id: number): void {
    //this.loading = true;

    this.expenseApi.findExpenseDetail(id).subscribe({next: detail => {
      this.expenseDetail = detail;
      //this.loading = false;
      this.cdr.markForCheck();
    },
    error: () => {
        //this.loading = false;
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



}

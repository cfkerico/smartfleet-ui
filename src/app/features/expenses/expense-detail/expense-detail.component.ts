import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ChangeDetectorRef } from '@angular/core';

import { ExpenseDetailView, ExpensePriority, ExpenseRequest, ExpenseStatus, ExpenseType, PaymentMethod } from '../../../models/expense.model';
import { ExpenseApiService } from '../../../core/services/expense-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { disbursementErrorMessage } from '../disbursement-error-message';
import { DisburseExpenseDialogComponent } from '../disburse-expense-dialog/disburse-expense-dialog.component';
import { ExpenseReasonDialogComponent } from '../expense-reason-dialog/expense-reason-dialog.component';

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
  loading = true;
  loadError = false;

  selectedTabIndex = 0;

  displayedDisbursementColumns = [
    'paymentDate',
    'paidAmount',
    'paymentMethod',
    'beneficiary',
    'referenceNumber',
    'createdBy',
    'comment'
  ];


  constructor(private route: ActivatedRoute, private router: Router, private expenseApi: ExpenseApiService, private cdr: ChangeDetectorRef, private dialog: MatDialog, private auth: AuthService, private notification: NotificationService) {}

  ngOnInit(): void {
    this.selectedTabIndex = this.route.snapshot.queryParamMap.get('tab') === 'documents' ? 3 : 0;
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || Number.isNaN(id)) {
      this.router.navigate(['/expenses']);
      return;
    }
    this.expenseId = id;
    this.loadExpense(id);
  }

  loadExpense(id: number): void {
    this.loading = true;
    this.loadError = false;

    this.expenseApi.findExpenseDetail(id).subscribe({next: detail => {
      this.expenseDetail = detail;
      this.loading = false;
      this.cdr.markForCheck();
    },
    error: error => {
      console.error('Erreur chargement dépense', error);
      this.loading = false;
      this.loadError = true;
      this.cdr.markForCheck();
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

  statusLabel(status: ExpenseStatus): string {
    const labels: Record<ExpenseStatus, string> = {
      REQUESTED: 'Demandée', APPROVED: 'Approuvée',
      PARTIALLY_DISBURSED: 'Partiellement décaissée', DISBURSED: 'Décaissée',
      REJECTED: 'Rejetée', CANCELLED: 'Annulée',
    };
    return labels[status] ?? status;
  }

  priorityLabel(priority: ExpensePriority): string {
    const labels: Record<ExpensePriority, string> = {
      LOW: 'Faible', NORMAL: 'Normale', HIGH: 'Élevée',
      URGENT: 'Urgente', CRITICAL: 'Critique',
    };
    return labels[priority] ?? priority;
  }

  typeLabel(type: ExpenseType): string {
    const labels: Record<ExpenseType, string> = {
      FUEL: 'Carburant', MAINTENANCE: 'Entretien', REPAIR: 'Réparation',
      SPARE_PART: 'Pièce détachée', INSURANCE: 'Assurance', TAX: 'Taxe',
      DOCUMENT: 'Document', SALARY: 'Salaire', UTILITY: 'Charge', OTHER: 'Autre',
    };
    return labels[type] ?? type;
  }

  paymentMethodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      CASH: 'Espèces', BANK_TRANSFER: 'Virement bancaire', CHECK: 'Chèque',
      MOBILE_MONEY: 'Mobile Money', CARD: 'Carte bancaire',
    };
    return labels[method] ?? method;
  }

  get request(): ExpenseRequest | undefined {
    return this.expenseDetail?.request;
  }

  canApprove(): boolean { return this.auth.hasRole('ADMIN'); }

  canDisburse(): boolean { return this.auth.hasRole('TREASURER'); }

  approve(): void {
    if (!this.canApprove() || !this.request) {
      return;
    }

    this.expenseApi.approveExpense(this.request.id).subscribe(() => {
      this.loadExpense(this.request!.id);
    });
  }

  reject(): void {
    if (!this.canApprove() || !this.request) {
      return;
    }

    const dialogRef = this.dialog.open(ExpenseReasonDialogComponent, 
      {
        width:'520px',
        data: {
          title: 'Rejeter la demande',
          message: `Vous allez rejeter la demande de ${this.request.requestedAmount} FCFA pour le véhicule ${this.request.vehicleLabel}.`,
          confirmLabel: "Confirmer le rejet",
          confirmColor: 'warn',
          placeholderMotif: 'Motif du rejet'
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

  cancel(): void{

      if (!this.request) {
        return;
      }

      const dialogRef = this.dialog.open(ExpenseReasonDialogComponent, {
        width: '520px',
        data: {
          title: 'Annuler la dépense',
          message: `Vous allez annuler la demande de ${this.request.requestedAmount} FCFA pour le véhicule ${this.request.vehicleLabel}.`,
          confirmLabel: "Confirmer l'annulation",
          confirmColor: 'warn',
          placeholderMotif: "Motif de l'annulation"
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (!result?.reason) {
          return;
        }

        this.expenseApi.cancelExpense(this.request!.id, result.reason).subscribe(() => {this.loadExpense(this.request!.id);
        });
      });
    }

  disburse(): void {
    if (!this.canDisburse() || !this.request) {
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

      const expenseId = this.request!.id;
      this.expenseApi.disburseExpense(expenseId, result).subscribe({
        next: () => {
          this.notification.success('Décaissement enregistré avec succès.');
          this.loadExpense(expenseId);
        },
        error: (error: HttpErrorResponse) =>
          this.notification.error(disbursementErrorMessage(error)),
      });
    });
  }



}

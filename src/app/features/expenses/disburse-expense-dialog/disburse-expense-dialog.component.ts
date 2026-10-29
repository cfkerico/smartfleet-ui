import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ExpenseRequest, PaymentMethod } from '../../../models/expense.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DepositApiService } from '../../treasury/deposit-api.service';
import { ExternalTreasuryAccount } from '../../treasury/deposit.model';

@Component({
  selector: 'app-disburse-expense-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './disburse-expense-dialog.component.html',
  styleUrl: './disburse-expense-dialog.component.scss',
})
export class DisburseExpenseDialogComponent implements OnInit {

  paymentMethods: PaymentMethod[] = [
    'CASH',
    'BANK_TRANSFER',
    'CHECK',
    'MOBILE_MONEY',
    'CARD'
  ];

  paymentMethodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      CASH: 'Espèces',
      BANK_TRANSFER: 'Virement bancaire',
      CHECK: 'Chèque',
      MOBILE_MONEY: 'Mobile Money',
      CARD: 'Carte bancaire',
    };
    return labels[method];
  }

  private readonly fb = inject(FormBuilder);
  private readonly treasuryApi = inject(DepositApiService);
  readonly accounts = signal<ExternalTreasuryAccount[]>([]);
  readonly accountsLoading = signal(true);
  readonly accountsError = signal(false);
  readonly legacyWithoutTreasury = signal(false);

  private readonly dialogRef = inject(MatDialogRef<DisburseExpenseDialogComponent>);
  readonly data = inject<{ expense: ExpenseRequest }>(MAT_DIALOG_DATA);


  form = this.fb.group({
    paidAmount: [
      null as number | null,
      [Validators.required, Validators.min(1)]
    ],

    paymentMethod: [null as PaymentMethod | null, Validators.required],
    sourceAccountId: [null as number | null, Validators.required],

    referenceNumber: [''],
    beneficiary: [''],
    comment: [''],
    paymentDate: [new Date(), Validators.required]
  });

  ngOnInit(): void {
    this.form.controls.paymentMethod.valueChanges.subscribe(() =>
      this.form.controls.sourceAccountId.setValue(null));
    this.treasuryApi.disbursementAccounts().subscribe({
      next: accounts => {
        this.accounts.set(accounts.filter(account => account.active));
        if (accounts.length === 0) {
          this.legacyWithoutTreasury.set(true);
          this.form.controls.sourceAccountId.clearValidators();
          this.form.controls.sourceAccountId.updateValueAndValidity();
        }
        this.accountsLoading.set(false);
      },
      error: () => {
        this.accountsError.set(true);
        this.accountsLoading.set(false);
      },
    });
  }

  availableAccounts(): ExternalTreasuryAccount[] {
    const method = this.form.controls.paymentMethod.value;
    const type = method === 'CASH' ? 'EXPENSE_CASH'
      : method === 'MOBILE_MONEY' ? 'MOBILE_MONEY'
      : method ? 'BANK' : null;
    return this.accounts().filter(account => account.type === type);
  }

  submit(): void {
    if (this.form.invalid || this.accountsLoading() || this.accountsError()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.dialogRef.close({
      paidAmount: raw.paidAmount,
      paymentMethod: raw.paymentMethod,
      sourceAccountId: raw.sourceAccountId,
      referenceNumber: raw.referenceNumber || null,
      beneficiary: raw.beneficiary || null,
      comment: raw.comment || null,
      paymentDate: this.toIsoInstant(raw.paymentDate!)
    });
  }

  close(): void {
    this.dialogRef.close(null);
  }

  private toIsoInstant(date: Date): string {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)).toISOString();
  }
}

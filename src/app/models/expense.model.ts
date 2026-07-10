export type ExpenseType = 
  | 'FUEL'
  | 'MAINTENANCE'
  | 'REPAIR'
  | 'SPARE_PART'
  | 'INSURANCE'
  | 'TAX'
  | 'DOCUMENT'
  | 'SALARY'
  | 'UTILITY'
  | 'OTHER';

export type ExpensePriority =
  | 'LOW'
  | 'NORMAL'
  | 'HIGH'
  | 'URGENT'
  | 'CRITICAL';

export type ExpenseStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'PARTIALLY_DISBURSED'
  | 'DISBURSED'
  | 'REJECTED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CHECK'
  | 'MOBILE_MONEY'
  | 'CARD';    

  export interface ExpenseRequest {
    id: number;
    vehicleId: number;
    vehicleLabel: string;
    expenseType: ExpenseType;
    description: string;
    requestedAmount: number;
    priority: ExpensePriority;
    status: ExpenseStatus;
    requestedBy: string;
    createdAt: Date;
  }
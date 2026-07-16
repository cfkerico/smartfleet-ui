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

  export type ExpenseTimelineType =
  | 'CREATED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'PARTIALLY_DISBURSED'
  | 'FULLY_DISBURSED';

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

  export interface ExpenseDisbursementView {
    id: number;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    beneficiary?: string | null;
    referenceNumber?: string | null;
    comment?: string | null;
    paymentDate: string;
    createdBy: string;
    createdAt: string;
  }

  export interface ExpenseTimelineItemView {
    date: string;
    type: ExpenseTimelineType;
    title: string;
    description?: string | null;
    icon: string;
    actorId?: string | null;
  }

  export interface ExpenseDetailView {
    request: ExpenseRequest;
    disbursements: ExpenseDisbursementView[];
    totalPaid: number;
    remainingAmount: number;
    fullyPaid: boolean;
    disbursementCount: number;
    timeline: ExpenseTimelineItemView[];
  }
export type TreasuryDepositStatus = 'PREPARING' | 'CONFIRMED';

export interface DepositAllocation {
  paymentId: number;
  amount: number;
}

export interface DepositAllocationDetails extends DepositAllocation {
  paymentDate: string;
  driverName: string;
  vehicleLabel: string;
}

export interface TreasuryDeposit {
  id: number;
  companyId: number;
  targetAccountId: number;
  amount: number;
  operationId: string;
  status: TreasuryDepositStatus;
  allocations: DepositAllocation[];
  proofDocumentId: number | null;
  createdBy: string;
  createdAt: string;
  confirmedBy: string | null;
  confirmedAt: string | null;
}

export interface DepositPage {
  content: TreasuryDeposit[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface EligibleDepositPayment {
  paymentId: number;
  driverId: number;
  vehicleId: number;
  driverName: string | null;
  vehicleLabel: string | null;
  paymentDate: string;
  paidAmount: number;
  alreadyDeposited: number;
  remainingAmount: number;
}

export interface EligibleDepositPaymentPage {
  content: EligibleDepositPayment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ExternalTreasuryAccount {
  id: number;
  type: 'EXPENSE_CASH' | 'BANK' | 'MOBILE_MONEY';
  name: string;
  currencyCode: string;
  balance: number;
  active: boolean;
}

export interface CashTreasuryAccount extends Omit<ExternalTreasuryAccount, 'type'> {
  type: 'COLLECTION_CASH' | 'EXPENSE_CASH';
}

export interface TransferCollectionCashRequest {
  collectionAccountId: number;
  expenseCashAccountId: number;
  amount: number;
  operationId: string;
}

export interface TransferCollectionCashResult {
  reference: string;
  collectionAccountId: number;
  collectionBalance: number;
  expenseCashAccountId: number;
  expenseCashBalance: number;
  transferredAmount: number;
  transferredAt: string;
}

export interface PrepareDepositRequest {
  targetAccountId: number;
  operationId: string;
  allocations: DepositAllocation[];
}

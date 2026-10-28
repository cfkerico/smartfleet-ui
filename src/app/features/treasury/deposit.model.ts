export type TreasuryDepositStatus = 'PREPARING' | 'CONFIRMED';

export interface DepositAllocation {
  paymentId: number;
  amount: number;
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

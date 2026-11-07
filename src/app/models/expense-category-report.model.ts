export interface ExpenseCategoryAmount {
  category: string;
  disbursedAmount: number;
}

export interface ExpenseCategoryReport {
  fromInclusive: string;
  toInclusive: string;
  totalDisbursed: number;
  categories: ExpenseCategoryAmount[];
}

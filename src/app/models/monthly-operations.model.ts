export interface MonthlyOperations {
  month: string;
  recordedRevenue: number;
  disbursedExpenses: number;
  operatingDifference: number;
}

export interface MonthlyOperationsSeries {
  fromMonth: string;
  toMonth: string;
  months: MonthlyOperations[];
}

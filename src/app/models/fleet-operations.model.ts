export interface FleetOperationsLine {
  vehicleId: number;
  vehicleLabel: string;
  vehicleStatus: string;
  recordedRevenue: number;
  disbursedExpenses: number;
  operatingDifference: number;
}

export interface FleetOperationsPage {
  fromInclusive: string;
  toInclusive: string;
  content: FleetOperationsLine[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

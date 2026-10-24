export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  label: string;
  year: number;
  vehicleStatus: string;
  fuelType: string;
  transmissionType?: string | null;
  version?: string | null;
  vin: string;
  registrationNumber: string;
  currentMileage?: number | null;
  acquisitionMileage?: number | null;
  engineCapacity?: number | null;
  horsePower?: number | null;
  acquisitionDate?: string | null;
  expectedDailyRevenue?: number | null;

}

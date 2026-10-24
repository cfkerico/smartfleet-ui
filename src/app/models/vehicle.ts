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

}

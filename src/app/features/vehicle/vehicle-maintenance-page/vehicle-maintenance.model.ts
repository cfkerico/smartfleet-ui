export interface VehicleMaintenance {
  id: number;
  vehicleId: number;
  type: string;
  status: string;
  completedDate: string;
  mileageAtMaintenance: number;
  costAmount: number | null;
}

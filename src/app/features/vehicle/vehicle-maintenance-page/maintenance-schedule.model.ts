export interface MaintenanceSchedule {
  id: number;
  vehicleId: number;
  type: string;
  status: 'ACTIVE' | 'INACTIVE';
  frequencyMileage: number | null;
  frequencyMonths: number | null;
  lastMaintenanceMileage: number | null;
  lastMaintenanceDate: string | null;
  nextDueMileage: number | null;
  nextDueDate: string | null;
}

export interface CreateMaintenanceScheduleRequest {
  vehicleId: number;
  type: string;
  frequencyMileage: number | null;
  frequencyMonths: number | null;
}

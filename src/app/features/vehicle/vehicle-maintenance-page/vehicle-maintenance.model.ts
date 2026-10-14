export interface VehicleMaintenance {
  id: number;
  vehicleId: number;
  type: string;
  status: string;
  completedDate: string;
  mileageAtMaintenance: number;
  costAmount: number | null;
  revisionNumber: number;
}

export interface MaintenanceRevision {
  revisionNumber: number;
  previous: MaintenanceSnapshot;
  corrected: MaintenanceSnapshot;
  reason: string;
  correctedBy: string;
  correctedAt: string;
}

export interface MaintenanceSnapshot {
  type: string;
  completedDate: string;
  mileageAtMaintenance: number;
  costAmount: number | null;
}

export interface CorrectMaintenanceRequest extends MaintenanceSnapshot {
  expectedRevision: number;
  reason: string;
}

export interface CorrectMaintenanceResponse {
  maintenance: VehicleMaintenance;
  mileageReviewRequired: boolean;
}

export interface VehicleMileageCorrection {
  vehicleId: number;
  maintenanceId: number;
  previousMileage: number | null;
  correctedMileage: number;
  reason: string;
  correctedBy: string;
  correctedAt: string;
}

export interface RecordCompletedMaintenanceRequest {
  vehicleId: number;
  type: string;
  completedDate: string;
  mileageAtMaintenance: number;
  costAmount: number | null;
}

export const MAINTENANCE_TYPES = [
  { value: 'OIL_CHANGE', label: 'Vidange' },
  { value: 'TIRE_CHANGE', label: 'Changement de pneus' },
  { value: 'BRAKE_CHECK', label: 'Contrôle des freins' },
  { value: 'ENGINE_REPAIR', label: 'Réparation moteur' },
  { value: 'TECHNICAL_INSPECTION', label: 'Contrôle technique' },
  { value: 'GENERAL_SERVICE', label: 'Entretien général' },
  { value: 'OTHER', label: 'Autre' },
] as const;

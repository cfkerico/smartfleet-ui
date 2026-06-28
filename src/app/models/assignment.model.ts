export interface VehicleAssignment {

    id: number;

    driverId: number;
    driverFullName: string;

    vehicleId: number;
    vehicleLabel: string;

    type: string;
    status: string;
    startDate: string;
    endDate?: string;
    reason?: string;
}

export enum AssignmentType {
    PRIMARY = 'PRIMARY',
    TEMPORARY_REMPLACEMENT = 'TEMPORARY_REMPLACEMENT',
    PROMOTION = 'PROMOTION'
}

export enum AssignmentStatus {
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    TEMPORARY_ACTIVE = 'TEMPORARY_ACTIVE',
    ENDED = 'ENDED',
    CANCELLED = 'CANCELLED'
}
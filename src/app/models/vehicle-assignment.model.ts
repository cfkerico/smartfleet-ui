export interface VehicleAssignment {
    id: number;

    driverId: number;
    driverFullName: string;

    vehicleId: number;
    vehicleLabel: string;

    type: string;
    status: string;

    stardDate: string;
    endDate?: string;
    reason?: string;
}
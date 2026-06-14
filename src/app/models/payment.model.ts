export interface DriverPayment {
    id: number;
    driverId: number;
    driverFullName: string;
    vehicleId: number;
    vehicleLabel: string;
    expectedAmount: number;
    paidAmount: number;
    differenceAmount: number;
    paymentDate: string;
    status: string;
    recordedBy: string;
}
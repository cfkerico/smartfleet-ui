export interface DriverPayment {
    id: number;
    driverId: number;
    vehicleId: number;
    expectedAmount: number;
    paidAmount: number;
    differenceAmount: number;
    paymentDate: string;
    status: string;
    recordedBy: string;
}
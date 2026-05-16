export interface DashboardAnalytics {

  totalDrivers: number;

  totalVehicles: number;

  averageScore: number;

  driverActivity: {
    [key: string]: number;
  };
}

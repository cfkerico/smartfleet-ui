import { environment } from '../../../environments/environment.development';

const baseUrl = environment.apiBaseUrl;

export const API_ENDPOINTS = {
  expenses: `${baseUrl}/api/expenses`,
  assignments: `${baseUrl}/api/assignments`,
  drivers: `${baseUrl}/api/drivers`,
  vehicles: `${baseUrl}/api/vehicles`,
  notifications: `${baseUrl}/api/notifications`,
  documentAdmin: `${baseUrl}/api/document-admin`,
  payments: `${baseUrl}/api/revenues/payments`,
  documents: `${baseUrl}/api/documents`,

  driversToAssign: `${baseUrl}/api/drivers/driverstoassign`,
  vehiclesToAssign: `${baseUrl}/api/vehicles/vehiclestoassign`,

  analiticsDashboard: `${baseUrl}/analytics/dashboard`,
  dashboard: `${baseUrl}/dashboard`
} as const;
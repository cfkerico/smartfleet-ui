import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResult } from '../../models/page-result.model';
import { CorrectMaintenanceRequest, CorrectMaintenanceResponse, MaintenanceRevision, RecordCompletedMaintenanceRequest, VehicleMaintenance, VehicleMileageCorrection } from '../../features/vehicle/vehicle-maintenance-page/vehicle-maintenance.model';
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly http = inject(HttpClient);

  findByVehicle(vehicleId: number, page: number, size: number): Observable<PageResult<VehicleMaintenance>> {
    const params = new HttpParams()
      .set('vehicleId', vehicleId)
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResult<VehicleMaintenance>>(API_ENDPOINTS.maintenances, { params });
  }

  recordCompleted(request: RecordCompletedMaintenanceRequest): Observable<VehicleMaintenance> {
    return this.http.post<VehicleMaintenance>(API_ENDPOINTS.maintenances, request);
  }

  findById(id: number): Observable<VehicleMaintenance> {
    return this.http.get<VehicleMaintenance>(`${API_ENDPOINTS.maintenances}/${id}`);
  }

  revisions(id: number): Observable<MaintenanceRevision[]> {
    return this.http.get<MaintenanceRevision[]>(`${API_ENDPOINTS.maintenances}/${id}/revisions`);
  }

  correct(id: number, request: CorrectMaintenanceRequest): Observable<CorrectMaintenanceResponse> {
    return this.http.post<CorrectMaintenanceResponse>(`${API_ENDPOINTS.maintenances}/${id}/corrections`, request);
  }

  correctVehicleMileage(vehicleId: number, maintenanceId: number, correctedMileage: number,
                        reason: string): Observable<VehicleMileageCorrection> {
    return this.http.post<VehicleMileageCorrection>(
      `${API_ENDPOINTS.vehicles}/${vehicleId}/mileage-corrections`,
      { maintenanceId, correctedMileage, reason });
  }

  vehicleMileageCorrections(vehicleId: number): Observable<VehicleMileageCorrection[]> {
    return this.http.get<VehicleMileageCorrection[]>(
      `${API_ENDPOINTS.vehicles}/${vehicleId}/mileage-corrections`);
  }
}

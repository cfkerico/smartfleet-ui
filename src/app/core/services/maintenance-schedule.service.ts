import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateMaintenanceScheduleRequest, MaintenanceSchedule } from '../../features/vehicle/vehicle-maintenance-page/maintenance-schedule.model';
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({ providedIn: 'root' })
export class MaintenanceScheduleService {
  private readonly http = inject(HttpClient);

  findByVehicle(vehicleId: number): Observable<MaintenanceSchedule[]> {
    return this.http.get<MaintenanceSchedule[]>(API_ENDPOINTS.maintenanceSchedules,
      { params: new HttpParams().set('vehicleId', vehicleId) });
  }

  create(request: CreateMaintenanceScheduleRequest): Observable<MaintenanceSchedule> {
    return this.http.post<MaintenanceSchedule>(API_ENDPOINTS.maintenanceSchedules, request);
  }

  deactivate(id: number): Observable<MaintenanceSchedule> {
    return this.http.post<MaintenanceSchedule>(`${API_ENDPOINTS.maintenanceSchedules}/${id}/deactivate`, {});
  }

  activate(id: number): Observable<MaintenanceSchedule> {
    return this.http.post<MaintenanceSchedule>(`${API_ENDPOINTS.maintenanceSchedules}/${id}/activate`, {});
  }
}

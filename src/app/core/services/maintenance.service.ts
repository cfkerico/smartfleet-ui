import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResult } from '../../models/page-result.model';
import { VehicleMaintenance } from '../../features/vehicle/vehicle-maintenance-page/vehicle-maintenance.model';
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
}

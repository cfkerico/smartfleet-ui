import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Vehicle} from '../../models/vehicle';
import {PageResponse} from '../../models/page-response.model';
import { API_ENDPOINTS } from '../config/api-endpoints';

export interface VehicleDetailsPayload {
  brand: string;
  model: string;
  version?: string | null;
  year: number;
  fuelType: string;
  transmission: string;
  engineCapacity?: number | null;
  horsePower?: number | null;
  acquisitionDate?: string | null;
  expectedDailyRevenue?: number | null;
  registrationNumber?: string | null;
  vin: string;
}

export interface VehicleAcquisitionPriceCorrection {
  companyId: number;
  vehicleId: number;
  previousPrice: number | null;
  correctedPrice: number;
  reason: string;
  correctedBy: string;
  correctedAt: string;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {

  private baseUrl = API_ENDPOINTS.vehicles;

  constructor(private http: HttpClient) { }

  getAll(page: number, size: number): Observable<PageResponse<Vehicle>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<Vehicle>>(`${this.baseUrl}`, {params});
  }
  
  getOptions(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.baseUrl}/options`);
  }

  getById(vehicleId: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.baseUrl}/${vehicleId}`);
  }

  create(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.baseUrl}`, vehicle);
  }

  update(vehicleId: number, vehicle: VehicleDetailsPayload): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${vehicleId}`, vehicle);
  }

  deactivate(vehicleId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${vehicleId}`);
  }

  reactivate(vehicleId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${vehicleId}/reactivate`, {});
  }

  correctAcquisitionPrice(vehicleId: number, correctedPrice: number, reason: string):
    Observable<VehicleAcquisitionPriceCorrection> {
    return this.http.post<VehicleAcquisitionPriceCorrection>(
      `${this.baseUrl}/${vehicleId}/acquisition-price-corrections`, { correctedPrice, reason });
  }

  getAcquisitionPriceCorrections(vehicleId: number): Observable<VehicleAcquisitionPriceCorrection[]> {
    return this.http.get<VehicleAcquisitionPriceCorrection[]>(
      `${this.baseUrl}/${vehicleId}/acquisition-price-corrections`);
  }

}

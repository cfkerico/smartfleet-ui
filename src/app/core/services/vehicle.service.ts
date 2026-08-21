import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Vehicle} from '../../models/vehicle';
import {PageResponse} from '../../models/page-response.model';
import { API_ENDPOINTS } from '../config/api-endpoints';

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
  
  getById(vehicleId: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.baseUrl}/${vehicleId}`);
  }

  create(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.baseUrl}`, vehicle);
  }

  update(vehicleId: number, vehicle: Vehicle): Observable<Vehicle> {
    console.log('---------------- Vehicle : ', JSON.stringify(vehicle));
    return this.http.put<Vehicle>(`${this.baseUrl}/${vehicleId}`, vehicle);
  }

  delete(vehicleId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${vehicleId}`);
  }

}

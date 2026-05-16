import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Vehicle} from '../../models/vehicle';
import {PageResponse} from '../../models/page-response.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {

  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  getAll(page: number, size: number): Observable<PageResponse<Vehicle>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<Vehicle>>(`${this.baseUrl}/vehicles`, {params});
  }

  create(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.baseUrl}/vehicles`, vehicle);
  }

  update(vehicleId: number, vehicle: Vehicle): Observable<Vehicle> {
    console.log('---------------- Vehicle : ', JSON.stringify(vehicle));
    return this.http.put<Vehicle>(`${this.baseUrl}/vehicles/${vehicleId}`, vehicle);
  }

  delete(vehicleId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/vehicles/${vehicleId}`);
  }
}

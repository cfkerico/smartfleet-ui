import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Driver } from '../../models/driver.model';
import { Vehicle } from '../../models/vehicle';
import { VehicleAssignment } from '../../models/vehicle-assignment.model';

@Injectable({
  providedIn: 'root',
})
export class AssignmentApiService {
  private readonly driverUrl = 'http://localhost:8080/api/drivers';
  private readonly vehicleUrl = 'http://localhost:8080/api/vehicles';
  private readonly assignmentUrl = 'http://localhost:8080/api/assignments';

  constructor(private http: HttpClient) {}

  findDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(this.driverUrl);
  }

  findVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.vehicleUrl);
  }

  findAssignments(): Observable<VehicleAssignment[]> {
    return this.http.get<VehicleAssignment[]>(this.assignmentUrl);
  }

  createAssignment(payload: any): Observable<number> {
    return this.http.post<number>(this.assignmentUrl, payload);
  }

  updateAssignment(id: number, payload: any): Observable<VehicleAssignment> {
    return this.http.put<VehicleAssignment>(`${this.assignmentUrl}/${id}`, payload);
  }
}

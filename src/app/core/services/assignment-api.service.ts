import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Driver } from '../../models/driver.model';
import { Vehicle } from '../../models/vehicle';
import { VehicleAssignment } from '../../models/vehicle-assignment.model';
import { PageResponse } from '../../models/page-response.model';

@Injectable({
  providedIn: 'root',
})
export class AssignmentApiService {
  private readonly driverUrl = 'http://localhost:8080/api/drivers/driverstoassign';
  private readonly vehicleUrl = 'http://localhost:8080/api/vehicles/vehiclestoassign';
  private readonly assignmentUrl = 'http://localhost:8080/api/assignments';

  constructor(private http: HttpClient) {}

  findDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(this.driverUrl);
  }

  findVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.vehicleUrl);
  }

  findAssignments(): Observable<VehicleAssignment[]> {
    return this.http.get<VehicleAssignment[]>(`${this.assignmentUrl}/tolist`);
  }

  createAssignment(payload: any): Observable<number> {
    console.log('************** createAssignment payload : ', payload);
    return this.http.post<number>(this.assignmentUrl, payload);
  }

  pausedAssignment(id: number, reason: string): Observable<VehicleAssignment> {
    const params = new HttpParams().set('reason', reason);
    return this.http.put<VehicleAssignment>(`${this.assignmentUrl}/paused/${id}`, null, { params });
  }

  resumeAssignment(id: number): Observable<VehicleAssignment> {
    return this.http.put<VehicleAssignment>(`${this.assignmentUrl}/resumed/${id}`, null);
  }

  getAll(page: number, size: number): Observable<PageResponse<VehicleAssignment>> {
      const params = new HttpParams()
        .set('page', page)
        .set('size', size);
        return this.http.get<PageResponse<VehicleAssignment>>(this.assignmentUrl, {params});
  }

  findActiveAssignments(): Observable<VehicleAssignment[]> {
    return this.http.get<VehicleAssignment[]>(`${this.assignmentUrl}/active `);
  }

  deleteAssignment(id: number): Observable<any> {
    return this.http.delete(`${this.assignmentUrl}/${id}`);
  }
}

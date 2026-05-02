import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Driver } from '../../models/driver.model';

@Injectable({ providedIn: 'root' })
export class DriverService {

    private apiUrl = 'http://localhost:8080/drivers';

    constructor(private http: HttpClient) {}

    getAll(): Observable<Driver[]> {
        return this.http.get<Driver[]>(this.apiUrl);
    }

    create(driver: Driver): Observable<Driver> {
        return this.http.post<Driver>(this.apiUrl, driver);
    }
}
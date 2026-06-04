import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Notification} from '../../models/Notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationApiService {

  private readonly apiUrl = 'http://localhost:8080/api/notifications';

  constructor(private http: HttpClient) {}

  getUnreadNotification(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/read`, {});
  }

}

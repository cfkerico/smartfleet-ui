import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../../models/Notification';
import { environment } from '../../../environments/environment.development';
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class NotificationApiService {

  private readonly apiUrl = API_ENDPOINTS.notifications;

  constructor(private http: HttpClient) {}

  getUnreadNotification(): Observable<Notification[]> {
    console.log('--------------- dans le unread :');
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/read`, {});
  }

}

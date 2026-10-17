import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { Subject, Observable } from 'rxjs';
import { Notification } from '../../models/Notification';
import { AuthService } from '../auth/auth.service';

export function notificationTopics(companyId: number, roles: string[]): string[] {
  const audiences = new Set(roles.filter(Boolean));
  if (audiences.has('ADMIN') || audiences.has('FLEET_MANAGER')) {
    audiences.add('MAINTENANCE_MANAGERS');
  }
  return [...audiences]
    .map(role => `/topic/notification/${companyId}/${role}`);
}

export function notificationConnectHeaders(token: string): Record<string, string> {
  if (!token.trim()) {
    throw new Error('A token is required for WebSocket notifications.');
  }
  return { Authorization: `Bearer ${token}` };
}

@Injectable({
  providedIn: 'root',
})
export class NotificationWebSocketService {

  constructor(private authService: AuthService) {}

  private client?: Client;

  private notificationSubject = new Subject<Notification>();
  notification$: Observable<Notification> = this.notificationSubject.asObservable();

  connect(): void {

    if (this.client?.active || !this.authService.isAuthenticated()) {
      return;
    }

    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',

      reconnectDelay: 3000,

      beforeConnect: async () => {
        const token = await this.authService.getFreshToken(true);
        if (!token) {
          throw new Error('Authentication is required for WebSocket notifications.');
        }
        this.client!.connectHeaders = notificationConnectHeaders(token);
      },

      onConnect: () => {

        console.log('Notification WebSocket connected');

        for (const topic of notificationTopics(this.authService.getCompanyId(), this.authService.getRoles())) {
          this.client?.subscribe(topic,
            message => {
              const notification = JSON.parse(message.body) as Notification;
              this.notificationSubject.next(notification);
            });
        }

      }
    });

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
  }
}

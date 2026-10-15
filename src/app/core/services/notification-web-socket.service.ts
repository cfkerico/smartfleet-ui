import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { Subject, Observable } from 'rxjs';
import { Notification } from '../../models/Notification';

export function notificationTopics(companyId: number, roles: string[]): string[] {
  return [...new Set(roles.filter(Boolean))]
    .map(role => `/topic/notification/${companyId}/${role}`);
}

@Injectable({
  providedIn: 'root',
})
export class NotificationWebSocketService {

  private client?: Client;

  private notificationSubject = new Subject<Notification>();
  notification$: Observable<Notification> = this.notificationSubject.asObservable();

  connect(companyId: number, roles: string[]): void {

    if (this.client?.active) {
      return;
    }

    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',

      reconnectDelay: 3000,

      debug: (message) => {

        console.log(message);
      },

      onConnect: () => {

        console.log('Notification WebSocket connected');

        for (const topic of notificationTopics(companyId, roles)) {
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
